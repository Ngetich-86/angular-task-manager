import { Router } from 'express';
import {
  createUserController,
  loginUserController,
  getAllUsersController,
  getUserByIdController,
  updateUserByIdController,
  deactivateUserController,
} from './auth.controller';
import { adminRoleAuth, userRoleAuth, bothRoleAuth } from '../middleware/bearAuth';

const router = Router();

// Public routes (no authentication required)
router.post('/register', createUserController);
router.post('/login', loginUserController);
router.use(bothRoleAuth); // Applies to all routes below

router.use(adminRoleAuth); // All routes below require admin role

router.get('/users', getAllUsersController);
router.get('/users/:id', getUserByIdController);
router.put('/users/:id', updateUserByIdController);
router.post('/users/:id/deactivate', deactivateUserController);
// router.post('/users/:id/reactivate', reactivateUserController);

export default router;