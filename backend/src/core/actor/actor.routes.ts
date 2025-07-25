import { Router } from 'express';
import { ActorController } from './actor.controller';
import { cacheMiddleware, clearCache } from '../cache/cache.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createActorSchema,
  updateActorSchema,
  executeActorSchema,
  deepSeekActorSchema,
  rateActorSchema,
  configureActorWithAISchema,
  testActorScrapingSchema,
  configureResponseFiltersSchema,
} from './actor.schema';
import { isAuthenticated } from '../auth/auth.middleware';

export function createActorRoutes(actorController: ActorController): Router {
  const router = Router();

  // Get all actors (with optional user filtering)
  router.get(
    '/',
    cacheMiddleware(300), // Cache for 5 minutes
    actorController.getAllActors
  );

  // Get actor by namespace
  router.get(
    '/namespace/:namespace',
    cacheMiddleware(300),
    actorController.getActorByNamespace
  );

  // Apply authentication middleware to all routes
  router.use(isAuthenticated);

  // Create new actor
  router.post(
    '/',
    clearCache('actors*'),
    validate(createActorSchema),
    actorController.createActor
  );

  // AI-assisted actor configuration
  router.post(
    '/:id/configure-with-ai',
    clearCache('actors*'),
    validate(configureActorWithAISchema),
    actorController.configureActorWithAI
  );

  // Test actor scraping with current configuration
  router.post(
    '/:id/test-scraping',
    validate(testActorScrapingSchema),
    actorController.testActorScraping
  );

  // Configure response filters
  router.post(
    '/:id/response-filters',
    clearCache('actors*'),
    validate(configureResponseFiltersSchema),
    actorController.configureResponseFilters
  );

  // Update actor
  router.put(
    '/:id',
    clearCache('actors*'),
    validate(updateActorSchema),
    actorController.updateActor
  );

  // Delete actor
  router.delete('/:id', clearCache('actors*'), actorController.deleteActor);

  // Execute actor with DeepSeek AI
  router.post(
    '/namespace/:namespace/deepseek',
    validate(deepSeekActorSchema),
    actorController.generateActorUrl
  );

  // Get actor prompts
  router.get(
    '/namespace/:namespace/prompts',
    cacheMiddleware(60), // Cache for 1 minute
    actorController.getActorPrompt
  );

  // Update a prompt
  router.put('/prompts/:id', isAuthenticated, actorController.updatePrompt);

  // Delete a prompt
  router.delete('/prompts/:id', isAuthenticated, actorController.deletePrompt);

  // Get actor executions
  router.get(
    '/:id/executions',
    cacheMiddleware(60), // Cache for 1 minute
    actorController.getActorExecutions
  );

  // Rating routes
  // Rate an actor
  router.post(
    '/:actorId/ratings',
    validate(rateActorSchema),
    actorController.rateActor
  );

  // Get all ratings for an actor
  router.get(
    '/:actorId/ratings',
    cacheMiddleware(60),
    actorController.getActorRatings
  );

  // Get user's rating for an actor
  router.get('/:actorId/ratings/user', actorController.getUserRating);

  // Update a rating
  router.put('/ratings/:id', actorController.updateRating);

  // Delete a rating
  router.delete('/ratings/:id', actorController.deleteRating);

  return router;
}
