/**
 * API Configuration - Central export for all API clients
 *
 * Usage:
 * const { AdminAPI, CubeAPI, AppAPI } = require('./config/api');
 */

const { AdminAPI, AppAPI } = require('./admin');
const { CubeAPI } = require('./cube');

module.exports = {
  AdminAPI,
  AppAPI,
  CubeAPI,
};
