import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  logout,
  seedDemoTasks,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Protected routes
router.get('/me', protect as any, getMe as any);
router.put('/profile', protect as any, updateProfile as any);
router.post('/seed', protect as any, seedDemoTasks as any);

export default router;
