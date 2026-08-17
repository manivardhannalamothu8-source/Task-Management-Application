import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserDAO } from '../config/dao.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-taskflow-jwt-key-2026';

export async function protect(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Please provide a valid authentication token.',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role?: string };
    const user = await UserDAO.findById(decoded.id);

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
      return;
    }

    req.user = {
      _id: (user as any)._id?.toString() || user._id,
      name: user.name,
      email: user.email,
      role: user.role || 'user',
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Authentication token has expired. Please log in again.',
        code: 'TOKEN_EXPIRED',
      });
      return;
    }
    res.status(401).json({
      success: false,
      message: 'Invalid authentication token.',
      code: 'INVALID_TOKEN',
    });
    return;
  }
}

export function authorizeRoles(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `User role '${req.user?.role || 'guest'}' is not authorized to access this route.`,
      });
      return;
    }
    next();
  };
}
