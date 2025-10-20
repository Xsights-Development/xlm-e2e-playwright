module.exports = {
  use: {
    baseURL: process.env.STAGING_BASE_URL || 'https://app-staging.xlm.com',
    headless: true,
  },
  retries: 2,
  workers: 2,
};