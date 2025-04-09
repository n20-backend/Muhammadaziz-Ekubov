import logger from './logger.js';

class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = {
  badRequest: (msg) => new ApiError(msg || 'Bad request', 400),
  unauthorized: (msg) => new ApiError(msg || 'Unauthorized', 401),
  forbidden: (msg) => new ApiError(msg || 'Forbidden', 403),
  notFound: (msg) => new ApiError(msg || 'Not found', 404),
  conflict: (msg) => new ApiError(msg || 'Conflict', 409),
  internal: (msg) => new ApiError(msg || 'Internal server error', 500)
};

export const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    logger.error('Error', {
      message: err.message,
      statusCode: err.statusCode,
      stack: err.stack
    });

    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err
    });
  } else {
    let error = { ...err };
    error.message = err.message;
    error.stack = err.stack;

    if (error.code === '23505') {
      error = errorHandler.conflict('Record already exists');
    }
    
    if (error.code === '22P02') {
      error = errorHandler.badRequest('Invalid input data');
    }
    
    if (error.code === '23503') {
      error = errorHandler.badRequest('Related record not found');
    }

    logger.error('Error', {
      message: error.message,
      statusCode: error.statusCode || 500,
      stack: error.stack
    });

    res.status(error.statusCode || 500).json({
      status: error.status || 'error',
      message: error.isOperational ? error.message : 'Something went wrong'
    });
  }
};

export default errorHandler;