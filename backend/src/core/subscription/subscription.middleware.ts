import { Request, Response, NextFunction } from 'express';
import { SUBSCRIPTION_LIMITS } from './subscription.constants';
import { prisma } from '../../lib/prisma';
import { redisClient } from '../../lib/redis';
import { SubscriptionService } from './subscription.service';

const subscriptionService = new SubscriptionService(prisma, redisClient);

export const checkSubscriptionLimits = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      return res.status(403).json({ error: 'No active subscription' });
    }

    const now = new Date();
    const lastReset = new Date(subscription.lastResetDate);
    const monthDiff =
      now.getMonth() -
      lastReset.getMonth() +
      (now.getFullYear() - lastReset.getFullYear()) * 12;

    // Reset counter if it's a new month
    if (monthDiff > 0) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          requestCount: 0,
          lastResetDate: now,
        },
      });
      subscription.requestCount = 0;
    }

    const limits = SUBSCRIPTION_LIMITS[subscription.plan];

    // Check if user has reached their request limit
    if (
      limits.requestLimit !== -1 &&
      subscription.requestCount >= limits.requestLimit
    ) {
      return res.status(429).json({
        error: 'Monthly request limit reached',
        limit: limits.requestLimit,
        current: subscription.requestCount,
      });
    }

    // Check data point limit if provided in request
    const dataPoints = req.body?.dataPoints || 0;
    if (limits.dataPointLimit !== -1 && dataPoints > limits.dataPointLimit) {
      return res.status(400).json({
        error: 'Data point limit exceeded',
        limit: limits.dataPointLimit,
        requested: dataPoints,
      });
    }

    // Increment request count
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        requestCount: subscription.requestCount + 1,
      },
    });

    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const requireValidSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const isValid = await subscriptionService.isSubscriptionValid(userId);
    if (!isValid) {
      return res.status(403).json({ error: 'Invalid or expired subscription' });
    }

    next();
  } catch (error) {
    console.error('Error validating subscription:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
