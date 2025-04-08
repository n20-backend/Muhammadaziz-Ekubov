import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

export const isAuthenticated = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Authentication error:', { error: error.message });
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      logger.warn(`User ${req.user.id} attempted to access a restricted route`);
      return res.status(403).json({
        message: `Access denied. ${roles.join(', ')} only.`,
      });
    }

    next();
  };
}; 