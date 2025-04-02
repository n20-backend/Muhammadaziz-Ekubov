import dotenv from 'dotenv';

dotenv.config();

const jwtConfig = {
  // Main JWT token configuration
  access: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '30m',
    algorithm: 'HS256',
  },
  
  // Refresh token configuration
  refresh: {
    secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh',
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    algorithm: 'HS256',
  },
  
  // Token verification options
  verifyOptions: {
    ignoreExpiration: false,
    algorithms: ['HS256'],
  }
};

export default jwtConfig;
