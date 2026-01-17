import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import { logger } from './shared/logger';
import { errorHandler } from './shared/errors';

// Import module routes
import { authRoutes } from './modules/auth';
import { workflowRoutes } from './modules/workflows';
import { runsRoutes, workflowRunsRoutes } from './modules/runs';
import { pluginRoutes } from './modules/plugins';

export const app: Application = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use(
  morgan(':method :url :status - :response-time ms', {
    stream: { write: (message: string) => logger.info(message.trim()) },
  })
);

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes - modular structure
app.use('/api/auth', authRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/workflows', workflowRunsRoutes); // For /workflows/:workflowId/runs
app.use('/api/runs', runsRoutes);
app.use('/api/plugins', pluginRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Global error handler (must be last)
app.use(errorHandler);
