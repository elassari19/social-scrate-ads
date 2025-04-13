import { PrismaClient, Subscription, SubscriptionPlan } from '@prisma/client';
import Stripe from 'stripe';
import { Redis } from 'ioredis';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// Check if API key exists before initializing Stripe
const stripeApiKey = process.env.STRIPE_SECRET_KEY;
if (!stripeApiKey) {
  console.error('Missing STRIPE_SECRET_KEY environment variable');
  process.exit(1);
}

const stripe = new Stripe(stripeApiKey, {
  apiVersion: '2025-03-31.basil', // Update to the latest stable version
});

export class SubscriptionService {
  constructor(private prisma: PrismaClient, private redis: Redis) {}

  async createSubscription(
    userId: string,
    priceId: string,
    plan: SubscriptionPlan
  ): Promise<Subscription> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true },
      });

      if (!user) throw new Error('User not found');

      // Create Stripe customer if not exists
      let stripeCustomerId = await this.redis.get(`stripe:customer:${userId}`);
      if (!stripeCustomerId) {
        try {
          const customer = await stripe.customers.create({
            email: user.email,
            metadata: { userId },
          });
          stripeCustomerId = customer.id;
          await this.redis.set(`stripe:customer:${userId}`, stripeCustomerId);
        } catch (error) {
          if (error instanceof Stripe.errors.StripeError) {
            throw new Error(
              `Failed to create Stripe customer: ${error.message}`
            );
          }
          throw error;
        }
      }

      // Create subscription in Stripe
      let stripeSubscription;
      try {
        stripeSubscription = await stripe.subscriptions.create({
          customer: stripeCustomerId,
          items: [{ price: priceId }],
          payment_behavior: 'default_incomplete',
          expand: ['latest_invoice.payment_intent'],
        });
      } catch (error) {
        if (error instanceof Stripe.errors.StripeError) {
          throw new Error(
            `Failed to create Stripe subscription: ${error.message}`
          );
        }
        throw error;
      }

      // Create subscription in database
      return await this.prisma.subscription.create({
        data: {
          userId,
          plan,
          status: 'pending',
          startDate: new Date(),
          endDate: new Date(
            (stripeSubscription as any).current_period_end * 1000
          ),
        },
      });
    } catch (error) {
      // Cleanup if needed
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async handleWebhook(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
          const subscription = event.data.object;
          const userId = subscription.metadata.userId;

          const product = await stripe.products.retrieve(
            subscription.items.data[0].price.product as string
          );

          await this.prisma.subscription.update({
            where: { userId },
            data: {
              plan: product.name as 'Basic' | 'Pro' | 'Business',
              status: subscription.status,
              endDate: new Date(subscription.ended_at! * 1000),
            },
          });
          break;
        }

        case 'invoice.payment_succeeded': {
          const invoice = event.data.object;
          const subscription = await stripe.subscriptions.retrieve(invoice.id!);

          await this.prisma.subscription.update({
            where: { userId: subscription.metadata.userId },
            data: { status: 'active' },
          });
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          const subscription = await stripe.subscriptions.retrieve(invoice.id!);

          await this.prisma.subscription.update({
            where: { userId: subscription.metadata.userId },
            data: { status: 'past_due' },
          });
          break;
        }
      }
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        throw new Error(`Stripe webhook error: ${error.message}`);
      }
      throw error;
    }
  }

  async cancelSubscription(userId: string): Promise<Subscription> {
    try {
      const subscription = await this.prisma.subscription.findUnique({
        where: { userId },
      });

      if (!subscription) throw new Error('Subscription not found');

      const stripeCustomerId = await this.redis.get(
        `stripe:customer:${userId}`
      );
      if (stripeCustomerId) {
        try {
          const stripeSubscriptions = await stripe.subscriptions.list({
            customer: stripeCustomerId,
            status: 'active',
          });

          for (const sub of stripeSubscriptions.data) {
            await stripe.subscriptions.cancel(sub.id);
          }
        } catch (error) {
          if (error instanceof Stripe.errors.StripeError) {
            throw new Error(
              `Failed to cancel Stripe subscription: ${error.message}`
            );
          }
          throw error;
        }
      }

      return await this.prisma.subscription.update({
        where: { userId },
        data: { status: 'cancelled', plan: 'Basic' },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async createCheckoutSession(
    userId: string,
    priceId: string,
    plan: string
  ): Promise<{ url: string }> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) throw new Error('User not found');

      let stripeCustomerId = await this.redis.get(`stripe:customer:${userId}`);
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: { userId },
        });
        stripeCustomerId = customer.id;
        await this.redis.set(`stripe:customer:${userId}`, stripeCustomerId);
      }

      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.CLIENT_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/subscription/cancel`,
        metadata: {
          userId,
        },
      });

      return { url: session.url! };
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        throw new Error(`Failed to create checkout session: ${error.message}`);
      }
      throw error;
    }
  }

  async isSubscriptionValid(userId: string): Promise<boolean> {
    try {
      const subscription = await this.prisma.subscription.findUnique({
        where: { userId },
      });

      if (!subscription) return false;

      const now = new Date();
      const isActive = subscription.status === 'active';
      const isWithinPeriod = subscription.endDate > now;

      // Verify with Stripe if needed
      const stripeCustomerId = await this.redis.get(
        `stripe:customer:${userId}`
      );
      if (stripeCustomerId) {
        try {
          const stripeSubscriptions = await stripe.subscriptions.list({
            customer: stripeCustomerId,
            status: 'active',
            limit: 1,
          });

          // Check if there's an active subscription in Stripe
          const hasActiveStripeSubscription =
            stripeSubscriptions.data.length > 0;
          return isActive && isWithinPeriod && hasActiveStripeSubscription;
        } catch (error) {
          if (error instanceof Stripe.errors.StripeError) {
            console.error(
              `Failed to verify Stripe subscription: ${error.message}`
            );
          }
          // Fall back to local DB status if Stripe verification fails
          return isActive && isWithinPeriod;
        }
      }

      return isActive && isWithinPeriod;
    } catch (error) {
      console.error('Error checking subscription validity:', error);
      return false;
    }
  }
}
