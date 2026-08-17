import { Router } from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  getDashboardStats,
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// All task routes require authentication
router.use(protect as any);

// Dashboard analytics
router.get('/stats/dashboard', getDashboardStats as any);

// Task CRUD
router.route('/')
  .get(getTasks as any)
  .post(createTask as any);

router.route('/:id')
  .get(getTaskById as any)
  .put(updateTask as any)
  .delete(deleteTask as any);

// Status change endpoint
router.patch('/:id/status', updateTaskStatus as any);

export default router;
