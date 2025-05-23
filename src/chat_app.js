import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import * as routes from './routes/index.js';
import logger from './utils/logger.js';
import { errorMiddleware } from './utils/errorHandler.js';

const app = express();

const PORT = process.env.PORT || 50500;

// Middleware
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser());
app.use(cors({ origin: '*', credentials: true }));

// API routes
app.use('/api/auth', routes.authRoutes);
app.use('/api/calls', routes.callsRoutes);
app.use('/api/profiles', routes.profilesRoutes);
app.use('/api/messages', routes.messagesRoutes);
app.use('/api/chats', routes.chatsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// 404 handler for undefined routes
app.all('*', (req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// Error handling middleware
app.use(errorMiddleware);

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! Shutting down...', { error: err.message, stack: err.stack });
  
  // Graceful shutdown
  app.close(() => {
    process.exit(1);
  });
});

