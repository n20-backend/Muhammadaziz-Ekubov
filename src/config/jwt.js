const jwtConfig = {
  access: {
    secret: process.env.JWT_SECRET || 'KiuTUrjaifv',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    algorithm: 'HS256',
  },

  refresh: {
    secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh' || 'KiuTUrjaifv_refresh',
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    algorithm: 'HS256',
  },
  
  verifyOptions: {
    ignoreExpiration: false,
    algorithms: ['HS256'],
  }
};

export default jwtConfig;