import { Request, Response } from 'express';
import { SubscriptionService } from './subscription.service';
import Stripe from 'stripe';

export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  createSubscription = async (req: Request, res: Response): Promise<void> => {
    try {
      const { priceId, plan } = req.body;
      const userId = req.user!.id; // Assuming auth middleware sets user

      const subscription = await this.subscriptionService.createSubscription(
        userId,
        priceId,
        plan
      );
      res.status(201).json(subscription);
    } catch (error) {
      console.error('Error creating subscription:', error);
      res.status(500).json({ error: 'Failed to create subscription' });
    }
  };

  createCheckoutSession = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { priceId, plan } = req.body;
      const userId = req.user!.id;

      const { url } = await this.subscriptionService.createCheckoutSession(
        userId,
        priceId,
        plan
      );
      res.json({ url });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  };

  cancelSubscription = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id; // Assuming auth middleware sets user
      const subscription = await this.subscriptionService.cancelSubscription(
        userId
      );
      res.json(subscription);
    } catch (error) {
      console.error('Error canceling subscription:', error);
      res.status(500).json({ error: 'Failed to cancel subscription' });
    }
  };

  handleWebhook = async (req: Request, res: Response): Promise<void> => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2025-03-31.basil',
      });

      const event = stripe.webhooks.constructEvent(
        req.body,
        sig as string,
        webhookSecret
      );

      await this.subscriptionService.handleWebhook(event);
      res.json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).json({ error: 'Webhook signature verification failed' });
    }
  };

  /**
   * Get the current balance for the authenticated user
   */
  getBalance = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const balance = await this.subscriptionService.getBalance(userId);
      res.json({ balance });
    } catch (error) {
      console.error('Error getting balance:', error);
      res.status(500).json({ error: 'Failed to get balance' });
    }
  };

  /**
   * Create a checkout session for adding funds to account
   */
  createDepositCheckoutSession = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { amount } = req.body;
      const userId = req.user!.id;

      if (!amount || typeof amount !== 'number' || amount < 5) {
        res.status(400).json({ error: 'Amount must be at least $5' });
        return;
      }

      const { url } =
        await this.subscriptionService.createDepositCheckoutSession(
          userId,
          amount
        );
      res.json({ url });
    } catch (error) {
      console.error('Error creating deposit checkout session:', error);
      res
        .status(500)
        .json({ error: 'Failed to create deposit checkout session' });
    }
  };

  /**
   * Process a successful deposit after Stripe checkout
   */
  processSuccessfulDeposit = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { sessionId } = req.body;

      if (!sessionId) {
        res.status(400).json({ error: 'Session ID is required' });
        return;
      }

      const subscription =
        await this.subscriptionService.processSuccessfulDeposit(sessionId);
      res.json({ success: true, subscription });
    } catch (error) {
      console.error('Error processing deposit:', error);
      res.status(500).json({ error: 'Failed to process deposit' });
    }
  };

  /**
   * Get transaction history for the authenticated user
   */
  getTransactionHistory = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const transactions = await this.subscriptionService.getTransactionHistory(
        userId
      );
      res.json(transactions);
    } catch (error) {
      console.error('Error getting transaction history:', error);
      res.status(500).json({ error: 'Failed to get transaction history' });
    }
  };
}
