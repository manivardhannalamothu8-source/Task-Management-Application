import { Response } from 'express';
import { TaskDAO } from '../config/dao.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { emitToUser } from '../sockets/socket.js';
import { TaskCategory, TaskPriority, TaskStatus } from '../models/Task.js';

// @desc    Get all tasks for current user with filtering, pagination, search, sorting
// @route   GET /api/tasks
// @access  Private
export async function getTasks(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { page, limit, search, status, priority, category, sortBy } = req.query;

    const result = await TaskDAO.findMany({
      userId: req.user._id,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 10,
      search: search as string,
      status: status as string,
      priority: priority as string,
      category: category as string,
      sortBy: sortBy as any,
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Error in getTasks:', error);
    res.status(500).json({ success: false, message: error.message || 'Error fetching tasks' });
  }
}

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
export async function getTaskById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const task = await TaskDAO.findById(req.params.id, req.user._id);

    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission to view it.',
      });
      return;
    }

    res.json({
      success: true,
      task,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
export async function createTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { title, description, status, priority, category, dueDate } = req.body;

    if (!title || !title.trim()) {
      res.status(400).json({
        success: false,
        message: 'Task title is required.',
      });
      return;
    }

    // Validate enum fields
    const validStatuses = ['Pending', 'In Progress', 'Completed'];
    const validPriorities = ['Low', 'Medium', 'High'];
    const validCategories = ['Work', 'Personal', 'Study', 'Shopping', 'Other'];

    if (status && !validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    if (priority && !validPriorities.includes(priority)) {
      res.status(400).json({ success: false, message: `Priority must be one of: ${validPriorities.join(', ')}` });
      return;
    }

    if (category && !validCategories.includes(category)) {
      res.status(400).json({ success: false, message: `Category must be one of: ${validCategories.join(', ')}` });
      return;
    }

    const task = await TaskDAO.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      status: (status || 'Pending') as TaskStatus,
      priority: (priority || 'Medium') as TaskPriority,
      category: (category || 'Work') as TaskCategory,
      dueDate: dueDate || null,
      userId: req.user._id,
    });

    // Real-time broadcast to user's devices
    emitToUser(req.user._id, 'task:created', task);

    res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      task,
    });
  } catch (error: any) {
    console.error('Error in createTask:', error);
    res.status(500).json({ success: false, message: error.message || 'Error creating task' });
  }
}

// @desc    Update an existing task
// @route   PUT /api/tasks/:id
// @access  Private
export async function updateTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const existingTask = await TaskDAO.findById(req.params.id, req.user._id);
    if (!existingTask) {
      res.status(404).json({
        success: false,
        message: 'Task not found or you are not authorized to edit it.',
      });
      return;
    }

    const { title, description, status, priority, category, dueDate } = req.body;
    const updatePayload: any = {};

    if (title !== undefined) {
      if (!title.trim()) {
        res.status(400).json({ success: false, message: 'Task title cannot be empty.' });
        return;
      }
      updatePayload.title = title.trim();
    }

    if (description !== undefined) updatePayload.description = description.trim();
    if (status !== undefined) updatePayload.status = status;
    if (priority !== undefined) updatePayload.priority = priority;
    if (category !== undefined) updatePayload.category = category;
    if (dueDate !== undefined) updatePayload.dueDate = dueDate;

    const updatedTask = await TaskDAO.update(req.params.id, req.user._id, updatePayload);

    // Real-time event
    emitToUser(req.user._id, 'task:updated', updatedTask);

    res.json({
      success: true,
      message: 'Task updated successfully.',
      task: updatedTask,
    });
  } catch (error: any) {
    console.error('Error in updateTask:', error);
    res.status(500).json({ success: false, message: error.message || 'Error updating task' });
  }
}

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
export async function deleteTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const existingTask = await TaskDAO.findById(req.params.id, req.user._id);
    if (!existingTask) {
      res.status(404).json({
        success: false,
        message: 'Task not found or you are not authorized to delete it.',
      });
      return;
    }

    await TaskDAO.delete(req.params.id, req.user._id);

    // Real-time event
    emitToUser(req.user._id, 'task:deleted', { id: req.params.id });

    res.json({
      success: true,
      message: 'Task deleted successfully.',
      id: req.params.id,
    });
  } catch (error: any) {
    console.error('Error in deleteTask:', error);
    res.status(500).json({ success: false, message: error.message || 'Error deleting task' });
  }
}

// @desc    Change task status
// @route   PATCH /api/tasks/:id/status
// @access  Private
export async function updateTaskStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { status } = req.body;
    const validStatuses = ['Pending', 'In Progress', 'Completed'];

    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: `Valid status required (${validStatuses.join(', ')}).`,
      });
      return;
    }

    const existingTask = await TaskDAO.findById(req.params.id, req.user._id);
    if (!existingTask) {
      res.status(404).json({
        success: false,
        message: 'Task not found or unauthorized.',
      });
      return;
    }

    const updatedTask = await TaskDAO.update(req.params.id, req.user._id, { status: status as TaskStatus });

    // Real-time event
    emitToUser(req.user._id, 'task:status_changed', updatedTask);

    res.json({
      success: true,
      message: `Task status marked as ${status}.`,
      task: updatedTask,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// @desc    Get user dashboard statistics
// @route   GET /api/tasks/stats/dashboard
// @access  Private
export async function getDashboardStats(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const stats = await TaskDAO.getStats(req.user._id);

    res.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: error.message || 'Error computing statistics' });
  }
}
