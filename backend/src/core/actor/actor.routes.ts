import { Router } from 'express';
import { ActorController } from './actor.controller';
import { cacheMiddleware } from '../cache/cache.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createActorSchema,
  updateActorSchema,
  executeActorSchema,
  deepSeekActorSchema,
  rateActorSchema,
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
  router.post('/', validate(createActorSchema), actorController.createActor);

  // Update actor
  router.put('/:id', validate(updateActorSchema), actorController.updateActor);

  // Delete actor
  router.delete('/:id', actorController.deleteActor);

  // Execute actor
  router.post(
    '/:id/execute',
    validate(executeActorSchema),
    actorController.executeActor
  );

  // Execute actor with DeepSeek AI
  router.post(
    '/namespace/:namespace/deepseek',
    validate(deepSeekActorSchema),
    actorController.executeActorWithDeepSeek
  );

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
