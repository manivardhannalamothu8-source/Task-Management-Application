import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserDAO, TaskDAO } from '../config/dao.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-taskflow-jwt-key-2026';
const JWT_EXPIRES_IN = '7d';

function generateToken(id: string, role: string): string {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validation
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password.',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters in length.',
      });
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      res.status(400).json({
        success: false,
        message: 'Password confirmation does not match password.',
      });
      return;
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
      return;
    }

    // Check existing
    const existingUser = await UserDAO.findByEmail(email);
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await UserDAO.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'user',
    });

    const userId = (user as any)._id?.toString() || user._id;

    // Automatically seed starter demo tasks for new users
    await TaskDAO.seedUserTasks(userId);

    const token = generateToken(userId, user.role);

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Starter tasks have been added.',
      token,
      user: {
        _id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration.',
    });
  }
}

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
      return;
    }

    // Get user with password
    const user: any = await UserDAO.findByEmail(email, true);
    if (!user || !user.password) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
      return;
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
      return;
    }

    const userId = (user as any)._id?.toString() || user._id;
    const token = generateToken(userId, user.role);

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        _id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during authentication.',
    });
  }
}

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export async function getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const user = await UserDAO.findById(req.user._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({
      success: true,
      user: {
        _id: (user as any)._id?.toString() || user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export async function updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { name, currentPassword, newPassword } = req.body;
    const updatePayload: any = {};

    if (name && name.trim()) {
      updatePayload.name = name.trim();
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
        return;
      }
      if (!currentPassword) {
        res.status(400).json({ success: false, message: 'Current password is required to set a new password' });
        return;
      }

      const user = await UserDAO.findByEmail(req.user.email, true);
      if (!user || !user.password) {
        res.status(400).json({ success: false, message: 'User verification failed' });
        return;
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        res.status(400).json({ success: false, message: 'Current password does not match' });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      updatePayload.password = await bcrypt.hash(newPassword, salt);
    }

    const updatedUser = await UserDAO.update(req.user._id, updatePayload);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: req.user._id,
        name: updatedUser?.name || req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public / Private
export function logout(req: Request, res: Response): void {
  res.json({
    success: true,
    message: 'Logged out successfully. Please clear client auth token.',
  });
}

// @desc    Seed demo tasks for authenticated user
// @route   POST /api/auth/seed
// @access  Private
export async function seedDemoTasks(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    await TaskDAO.seedUserTasks(req.user._id);

    res.json({
      success: true,
      message: 'Demo tasks seeded successfully.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
