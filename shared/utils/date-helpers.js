// shared/utils/date-helpers.js

/**
 * Date Helper Functions
 * Shared by all tests
 */

/**
 * Get current date in YYYY-MM-DD format
 */
function getCurrentDate() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Get current timestamp
 */
function getCurrentTimestamp() {
  return new Date().toISOString();
}

/**
 * Format date to Vietnamese format
 */
function formatDateVN(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Get date X days from now
 */
function getDateFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

/**
 * Get date X days ago
 */
function getDateFromPast(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

/**
 * Check if date is valid
 */
function isValidDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

/**
 * Parse date string to Date object
 */
function parseDate(dateString) {
  return new Date(dateString);
}

module.exports = {
  getCurrentDate,
  getCurrentTimestamp,
  formatDateVN,
  getDateFromNow,
  getDateFromPast,
  isValidDate,
  parseDate,
};