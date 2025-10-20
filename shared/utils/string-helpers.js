// shared/utils/string-helpers.js

/**
 * String Helper Functions
 */

/**
 * Generate random string
 */
function randomString(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate random email
 */
function randomEmail(domain = 'xlm.com') {
  const username = randomString(10).toLowerCase();
  return `${username}@${domain}`;
}

/**
 * Generate random number
 */
function randomNumber(min = 0, max = 100) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random phone number (Vietnam format)
 */
function randomPhoneVN() {
  const prefixes = ['090', '091', '092', '093', '094', '096', '097', '098', '099'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = randomNumber(1000000, 9999999);
  return `${prefix}${suffix}`;
}

/**
 * Capitalize first letter
 */
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Truncate string
 */
function truncate(string, maxLength = 50) {
  if (string.length <= maxLength) return string;
  return string.substring(0, maxLength) + '...';
}

/**
 * Slugify string
 */
function slugify(string) {
  return string
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Remove accents from Vietnamese text
 */
function removeVietnameseAccents(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

module.exports = {
  randomString,
  randomEmail,
  randomNumber,
  randomPhoneVN,
  capitalizeFirstLetter,
  truncate,
  slugify,
  removeVietnameseAccents,
};