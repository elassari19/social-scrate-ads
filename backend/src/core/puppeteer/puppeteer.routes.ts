import { Router } from 'express';
import { PuppeteerController } from './puppeteer.controller';
import { isAuthenticated } from '../auth/auth.middleware';

export function createPuppeteerRoutes(
  puppeteerController: PuppeteerController
): Router {
  const router = Router();

  // Apply authentication middleware to all routes
  router.use(isAuthenticated);

  // Generate Puppeteer script for a specific URL
  router.post('/generate-script', puppeteerController.gerUrlContent);

  // Select a specific response from puppeteer navigation
  router.post('/select-response', puppeteerController.selectResponse);

  return router;
}
