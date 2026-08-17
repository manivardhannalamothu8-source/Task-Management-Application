import { Request, Response, NextFunction } from 'express';

export function notFound(req: Request, res: Response, next: NextFunction): void {
  const error = new Error(`API Route Not Found: ${req.originalUrl}`);
  res.status(404);
  next(error);
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose / Mongo Errors
  if (err.name === 'CastError') {
    message = `Resource not found with invalid identifier: ${err.value}`;
    statusCode = 404;
  } else if (err.code === 11000) {
    message = 'Duplicate field value entered. A record with this value already exists.';
    statusCode = 400;
  } else if (err.name === 'ValidationError') {
    const errorMessages = Object.values(err.errors || {}).map((val: any) => val.message);
    message = errorMessages.join(', ') || 'Validation error';
    statusCode = 400;
  } else if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token. Please authenticate again.';
    statusCode = 401;
  } else if (err.name === 'TokenExpiredError') {
    message = 'Your session has expired. Please log in again.';
    statusCode = 401;
  }

  res.status(statusCode).json({
    success: false,
    message,
    statusCode,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
}
