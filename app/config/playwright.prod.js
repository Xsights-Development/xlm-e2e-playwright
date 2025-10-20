module.exports = {
  use: {
    baseURL: process.env.PROD_BASE_URL || 'https://app.xlm.com',
    headless: true,
  },
  retries: 1,
  workers: 1,
  testMatch: /.*\.smoke\.spec\.js/,
  grep: /@smoke/,
};