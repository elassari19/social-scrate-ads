import { Router } from 'express';
import { PuppeteerController } from './puppeteer.controller';
import { cacheMiddleware } from '../cache/cache.middleware';
import { isAuthenticated } from '../auth/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { webContentDeepSeekSchema } from './puppeteer.schema';

export function createPuppeteerRoutes(
  puppeteerController: PuppeteerController
): Router {
  const router = Router();

  // Apply authentication middleware to all routes
  router.use(isAuthenticated);

  // Single endpoint for web content processing with DeepSeek AI and user prompts
  router.post(
    '/scrape',
    validate(webContentDeepSeekSchema),
    cacheMiddleware(1800), // Cache for 30 minutes
    puppeteerController.processWebContentWithDeepSeek
  );

  return router;
}
