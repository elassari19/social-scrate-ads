import {
  PrismaClient,
  Subscription,
  SubscriptionPlan,
  TransactionType,
} from '@prisma/client';
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

  /**
   * Add funds to a user's subscription balance
   * @param userId User ID
   * @param amount Amount to deposit (minimum $5)
   * @returns Updated subscription with new balance
   */
  async depositFunds(userId: string, amount: number): Promise<Subscription> {
    try {
      if (amount < 5) {
        throw new Error('Minimum deposit amount is $5');
      }

      // Get user's subscription
      const subscription = await this.prisma.subscription.findUnique({
        where: { userId },
      });

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      // Create payment intent with Stripe
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Get or create Stripe customer
      let stripeCustomerId = await this.redis.get(`stripe:customer:${userId}`);
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: { userId },
        });
        stripeCustomerId = customer.id;
        await this.redis.set(`stripe:customer:${userId}`, stripeCustomerId);
      }

      // Create a payment intent for the deposit
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        customer: stripeCustomerId,
        metadata: {
          userId,
          type: 'deposit',
        },
      });

      // Update subscription balance in transaction
      return await this.prisma.$transaction(async (tx) => {
        // Record the transaction
        await tx.transaction.create({
          data: {
            amount,
            type: TransactionType.Deposit,
            description: `Deposit of $${amount.toFixed(2)}`,
            subscriptionId: subscription.id,
          },
        });

        // Update the subscription balance
        return await tx.subscription.update({
          where: { id: subscription.id },
          data: {
            balance: {
              increment: amount,
            },
          },
        });
      });
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        throw new Error(`Payment processing error: ${error.message}`);
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  /**
   * Get the current balance of a user's subscription
   * @param userId User ID
   * @returns Current balance
   */
  async getBalance(userId: string): Promise<number> {
    try {
      const subscription = await this.prisma.subscription.findUnique({
        where: { userId },
      });

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      return subscription.balance;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  /**
   * Get transaction history for a user's subscription
   * @param userId User ID
   * @returns Array of transactions
   */
  async getTransactionHistory(userId: string) {
    try {
      const subscription = await this.prisma.subscription.findUnique({
        where: { userId },
      });

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      return await this.prisma.transaction.findMany({
        where: { subscriptionId: subscription.id },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  /**
   * Create a Stripe checkout session for adding funds to account
   * @param userId User ID
   * @param amount Amount to add (minimum $5)
   * @returns Checkout session URL
   */
  async createDepositCheckoutSession(
    userId: string,
    amount: number
  ): Promise<{ url: string }> {
    try {
      if (amount < 5) {
        throw new Error('Minimum deposit amount is $5');
      }

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
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Account Deposit',
                description: `Add $${amount.toFixed(
                  2
                )} to your account balance`,
              },
              unit_amount: Math.round(amount * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.CLIENT_URL}/deposit/success?session_id={CHECKOUT_SESSION_ID}&amount=${amount}`,
        cancel_url: `${process.env.CLIENT_URL}/deposit/cancel`,
        metadata: {
          userId,
          type: 'deposit',
          amount: amount.toString(),
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

  /**
   * Process a successful deposit after Stripe checkout
   * @param sessionId Stripe checkout session ID
   * @returns Updated subscription
   */
  async processSuccessfulDeposit(sessionId: string): Promise<Subscription> {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (
        !session ||
        !session.metadata ||
        !session.metadata.userId ||
        session.metadata.type !== 'deposit'
      ) {
        throw new Error('Invalid session');
      }

      const userId = session.metadata.userId;
      const amount = parseFloat(session.metadata.amount);

      if (isNaN(amount)) {
        throw new Error('Invalid amount');
      }

      return await this.depositFunds(userId, amount);
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        throw new Error(`Stripe error: ${error.message}`);
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  /**
   * Check if user has enough balance for an operation
   * @param userId User ID
   * @param requiredAmount Amount needed for operation
   * @returns Boolean indicating if user has sufficient balance
   */
  async hasSufficientBalance(
    userId: string,
    requiredAmount: number
  ): Promise<boolean> {
    try {
      const balance = await this.getBalance(userId);
      return balance >= requiredAmount;
    } catch (error) {
      return false;
    }
  }

  /**
   * Deduct amount from user's balance for service usage
   * @param userId User ID
   * @param amount Amount to deduct
   * @param description Description of the usage
   * @returns Updated subscription with new balance
   */
  async deductBalance(
    userId: string,
    amount: number,
    description: string
  ): Promise<Subscription> {
    try {
      const subscription = await this.prisma.subscription.findUnique({
        where: { userId },
      });

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      if (subscription.balance < amount) {
        throw new Error('Insufficient balance');
      }

      // Update subscription balance in transaction
      return await this.prisma.$transaction(async (tx) => {
        // Record the transaction
        await tx.transaction.create({
          data: {
            amount: -amount,
            type: TransactionType.Usage,
            description,
            subscriptionId: subscription.id,
          },
        });

        // Update the subscription balance
        return await tx.subscription.update({
          where: { id: subscription.id },
          data: {
            balance: {
              decrement: amount,
            },
          },
        });
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }
}
