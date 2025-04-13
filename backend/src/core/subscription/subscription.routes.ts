import { Router } from 'express';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';
import express from 'express';
import { isAuthenticated } from '../auth/auth.middleware';

const router = Router();
const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL!);

const subscriptionService = new SubscriptionService(prisma, redis);
const subscriptionController = new SubscriptionController(subscriptionService);

router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  subscriptionController.handleWebhook
);

// Protected routes for authenticated endpoints
router.use(isAuthenticated);

router.post('/create', subscriptionController.createSubscription);
router.post('/checkout-session', subscriptionController.createCheckoutSession);
router.post('/cancel', subscriptionController.cancelSubscription);

// Export the controller for use in the main app.ts
export { subscriptionController };
export default router;
