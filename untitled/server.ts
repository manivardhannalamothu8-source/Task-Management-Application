import http from 'http';
import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import { connectDB, getDatabaseStatus } from './server/config/db.js';
import { initializeSocket } from './server/sockets/socket.js';
import authRoutes from './server/routes/authRoutes.js';
import taskRoutes from './server/routes/taskRoutes.js';
import { notFound, errorHandler } from './server/middleware/errorMiddleware.js';

dotenv.config();

const PORT = 3000;
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  // Initialize Socket.IO real-time engine
  initializeSocket(httpServer);

  // Connect to Database (MongoDB or persistent embedded storage)
  await connectDB();

  // Security Middleware
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disabled to allow Vite script injection and local asset previews
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS configuration
  app.use(
    cors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    })
  );

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Rate Limiting (Protects API against spam/brute force)
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Generous limit for full interactive experience
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests from this IP. Please try again later.',
    },
  });
  app.use('/api', apiLimiter);

  // API Health and System Status routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'TaskFlow API Server',
    });
  });

  app.get('/api/system/status', (req, res) => {
    const dbStatus = getDatabaseStatus();
    res.json({
      success: true,
      system: {
        environment: process.env.NODE_ENV || 'development',
        database: dbStatus,
        realtime: {
          socketIO: true,
          status: 'active',
        },
        uptime: process.uptime(),
      },
    });
  });

  // REST API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/tasks', taskRoutes);

  // API 404 Catch-All (only applies to /api/*)
  app.use('/api/*', notFound);

  // Centralized Error Middleware for API
  app.use(errorHandler);

  // Frontend Serving (Vite Development Middleware or Static Production)
  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Start HTTP & WebSocket Server
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 TaskFlow Server is running on port ${PORT} [Host: 0.0.0.0]`);
    console.log(`📡 Real-time Socket.IO initialized on path: /socket.io`);
  });
}

startServer().catch((error) => {
  console.error('Fatal error during server startup:', error);
  process.exit(1);
});
