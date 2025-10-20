// admin/tests/utils/env.js
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const ENV = process.env.TEST_ENV || 'local';

const environments = {
  local: {
    baseURL: process.env.LOCAL_BASE_URL || 'http://localhost:4000',
    apiURL: process.env.API_URL || 'http://localhost:4000/api',
    adminUser: {
      email: process.env.ADMIN_TEST_EMAIL || 'admin@xlm.com',
      password: process.env.ADMIN_TEST_PASSWORD || 'AdminPass123!',
    },
  },
  
  staging: {
    baseURL: process.env.STAGING_BASE_URL || 'https://admin-staging.xlm.com',
    apiURL: process.env.STAGING_API_URL || 'https://api-staging.xlm.com',
    adminUser: {
      email: process.env.STAGING_ADMIN_EMAIL,
      password: process.env.STAGING_ADMIN_PASSWORD,
    },
  },
  
  prod: {
    baseURL: process.env.PROD_BASE_URL || 'https://admin.xlm.com',
    apiURL: process.env.PROD_API_URL || 'https://api.xlm.com',
    adminUser: {
      email: process.env.PROD_ADMIN_EMAIL,
      password: process.env.PROD_ADMIN_PASSWORD,
    },
  },
};

const currentEnv = environments[ENV];

if (!currentEnv) {
  throw new Error(`Invalid TEST_ENV: ${ENV}. Must be one of: local, staging, prod`);
}

module.exports = {
  ENV,
  ...currentEnv,
  
  isLocal: () => ENV === 'local',
  isStaging: () => ENV === 'staging',
  isProduction: () => ENV === 'prod',
  
  timeout: {
    default: parseInt(process.env.DEFAULT_TIMEOUT) || 30000,
    navigation: parseInt(process.env.NAVIGATION_TIMEOUT) || 30000,
  },
};