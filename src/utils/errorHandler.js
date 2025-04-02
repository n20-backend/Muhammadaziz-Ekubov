import logger from './logger.js';

// Error handling utilities
const badRequest = (message = 'Bad Request') => ({ statusCode: 400, message });
const unauthorized = (message = 'Unauthorized') => ({ statusCode: 401, message });
const forbidden = (message = 'Forbidden') => ({ statusCode: 403, message });
const notFound = (message = 'Not Found') => ({ statusCode: 404, message });
const conflict = (message = 'Conflict') => ({ statusCode: 409, message });
const internalServerError = (message = 'Internal Server Error') => ({ statusCode: 500, message });

// Centralized error handling middleware
const errorHandler = (err, req, res, next) => {
  if (!err.statusCode) {
    // Unexpected error
    logger.error(`Unexpected Error: ${err.message}`, { 
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      body: req.body
    });

    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }

  // Log operational errors
  logger.warn(`Operational Error: ${err.message}`, { 
    url: req.originalUrl,
    method: req.method,
    statusCode: err.statusCode
  });

  res.status(err.statusCode).json({
    status: 'fail',
    message: err.message,
  });
};

// Exporting all utilities
export default {
    badRequest,
    unauthorized,
    forbidden,
    notFound,
    conflict,
    internalServerError,
    errorHandler
}