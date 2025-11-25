const dotenv = require('dotenv');
dotenv.config();

const env = {
  // App Configuration
  APP_URL: process.env.APP_URL || 'http://localhost:3000',
  APP_USER: process.env.APP_USER || 'user',
  APP_PASS: process.env.APP_PASS || 'pass',
  APP_TENANT: process.env.APP_TENANT || 'tenant',
  APP_FARM: process.env.APP_FARM || 'farm',

  // Admin API Configuration
  ADMIN_API_URL: process.env.ADMIN_API_URL || 'https://api.staging.xiot.com.au/admin',
  ADMIN_USER: process.env.ADMIN_USER || 'admin',
  ADMIN_PASS: process.env.ADMIN_PASS || 'pass',

  // CubeJS Configuration
  CUBE_API_URL: process.env.CUBE_API_URL || 'https://cube.staging.xiot.com.au/cubejs-api/v1',
  CUBE_API_TOKEN: process.env.CUBE_API_TOKEN || '',

  // Notification Configuration
  SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL || '',
};

module.exports = { env };