import { Router } from 'express';
import { userController } from './users.controllers';
import { cacheMiddleware, clearCache } from '../cache';
import { validate } from '../middleware/validation.middleware';
import { CreateUserDtoSchema, UpdateUserDtoSchema } from './users.schema';

const router = Router();

// Get all users
router.get(
  '/',
  cacheMiddleware(300, 'users'),
  userController.getAllUsers.bind(userController)
);

// Get user by ID
router.get(
  '/:id',
  cacheMiddleware(300, 'users'),
  userController.getUserById.bind(userController)
);

// Create new user
// Update routes to use validation middleware
router.post(
  '/',
  clearCache('users*'),
  validate(CreateUserDtoSchema),
  userController.createUser.bind(userController)
);

router.put(
  '/:id',
  clearCache('users*'),
  validate(UpdateUserDtoSchema),
  userController.updateUser.bind(userController)
);

// Delete user
router.delete(
  '/:id',
  clearCache('users*'),
  userController.deleteUser.bind(userController)
);

export default router;
