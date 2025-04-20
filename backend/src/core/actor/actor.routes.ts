import { Router } from 'express';
import { ActorController } from './actor.controller';
import { cacheMiddleware } from '../cache/cache.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createActorSchema,
  updateActorSchema,
  executeActorSchema,
} from './actor.schema';
import { isAuthenticated } from '../auth/auth.middleware';

export function createActorRoutes(actorController: ActorController): Router {
  const router = Router();

  // Apply authentication middleware to all routes
  router.use(isAuthenticated);

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

  // Get actor executions
  router.get(
    '/:id/executions',
    cacheMiddleware(60), // Cache for 1 minute
    actorController.getActorExecutions
  );

  return router;
}
