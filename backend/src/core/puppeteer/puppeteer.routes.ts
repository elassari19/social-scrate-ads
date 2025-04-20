import { Router } from 'express';
import { PuppeteerController } from './puppeteer.controller';
import { cacheMiddleware } from '../cache/cache.middleware';
import { isAuthenticated } from '../auth/auth.middleware';

export function createPuppeteerRoutes(
  puppeteerController: PuppeteerController
): Router {
  const router = Router();

  // Apply authentication middleware to all routes
  router.use(isAuthenticated);

  // General scraping endpoint
  router.post(
    '/scrape',
    cacheMiddleware(3600), // Cache for 1 hour
    puppeteerController.scrapeContent
  );

  // Specialized social media ads scraping endpoint
  router.post(
    '/social-ads',
    cacheMiddleware(1800), // Cache for 30 minutes
    puppeteerController.scrapeSocialMediaAds
  );

  return router;
}
