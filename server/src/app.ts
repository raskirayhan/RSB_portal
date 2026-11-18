import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { ENV } from './config/env.js';
import routes from './routes/index.js';
import { globalErrorHandler } from './middlewares/globalErrorHandler.js';
import { notFound } from './middlewares/notFound.js';

const app: Application = express();

// Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman) or client origins
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-device-id', 'X-Requested-With'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root Route Check
app.get(['/', '/api'], (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    service: 'Rayhan Special Batch (RSB_portal) Backend RESTful API',
    version: '1.0.0',
    description: 'SSC & HSC Science Coaching Management System',
  });
});

// Health Check Endpoint
app.get(['/health', '/api/health', '/api/v1/health'], (req: Request, res: Response) => {
  res.status(200).json({
    status: 'online',
    success: true,
    service: 'Rayhan Special Batch (RSB_portal) Core Engine',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Mount Application API Routes (Both /api and /api/v1 aliases supported)
app.use('/api', routes);
app.use('/api/v1', routes);

// 404 Route Handler
app.use(notFound);

// Global Error Handler (Programming Hero Level 2 Pattern)
app.use(globalErrorHandler);

export default app;
