const moment = require('moment');
const momentTimezone = require('moment-timezone');

/**
 * Get local current time using moment
 * @returns {moment.Moment} Current local moment object
 */
const getLocalNow = () => {
  return moment();
};

/**
 * Get test date range for the last 4 weeks (current week + 3 weeks back)
 * Date range covers from start of ISO week (Monday) 3 weeks ago to end of current ISO week (Sunday)
 *
 * @returns {Object} Object with startDate and endDate strings
 * @returns {string} startDate - Start date in format 'YYYY-MM-DD 00:00:00'
 * @returns {string} endDate - End date in format 'YYYY-MM-DD 23:59:59'
 */
const getTestDateRange = () => {
  const now = getLocalNow();
  const endDate = now.clone().endOf('isoWeek');
  const startDate = endDate.clone().subtract(3, 'weeks').startOf('isoWeek');

  return {
    startDate: startDate.format('YYYY-MM-DD 00:00:00'),
    endDate: endDate.format('YYYY-MM-DD 23:59:59'),
  };
};

/**
 * Convert date string from a specific timezone to UTC
 * Useful for normalizing dates before sending to APIs that expect UTC
 *
 * @param {string} dateString - Date string in format 'YYYY-MM-DD HH:mm:ss' or 'YYYY-MM-DDTHH:mm:ss'
 * @param {string} sourceTimezone - Source timezone (e.g., 'Australia/Perth', 'America/New_York')
 * @returns {string} Date string in UTC format 'YYYY-MM-DD HH:mm:ss'
 *
 * @example
 * // Convert Perth time to UTC
 * convertDateToUTC('2025-11-03 00:00:00', 'Australia/Perth')
 * // Returns: '2025-11-02 16:00:00' (Perth is UTC+8)
 */
const convertDateToUTC = (dateString, sourceTimezone) => {
  if (!dateString || !sourceTimezone) {
    throw new Error('Both dateString and sourceTimezone are required');
  }

  try {
    // Parse date as being in the source timezone
    const dateInSourceTz = momentTimezone.tz(dateString, sourceTimezone);

    // Convert to UTC and format
    return dateInSourceTz.utc().format('YYYY-MM-DD HH:mm:ss');
  } catch (error) {
    throw new Error(`Failed to convert date to UTC: ${error.message}`);
  }
};

/**
 * Convert date string between any two timezones
 * Generic timezone conversion utility
 *
 * @param {string} dateString - Date string in format 'YYYY-MM-DD HH:mm:ss' or 'YYYY-MM-DDTHH:mm:ss'
 * @param {string} fromTimezone - Source timezone (e.g., 'Australia/Perth')
 * @param {string} toTimezone - Target timezone (e.g., 'America/New_York', 'UTC')
 * @returns {string} Date string in target timezone format 'YYYY-MM-DD HH:mm:ss'
 *
 * @example
 * // Convert from Perth to New York time
 * convertDateBetweenTimezones('2025-11-03 08:00:00', 'Australia/Perth', 'America/New_York')
 * // Returns: '2025-11-02 19:00:00'
 */
const convertDateBetweenTimezones = (dateString, fromTimezone, toTimezone) => {
  if (!dateString || !fromTimezone || !toTimezone) {
    throw new Error('dateString, fromTimezone, and toTimezone are all required');
  }

  try {
    // Parse date as being in the source timezone
    const dateInSourceTz = momentTimezone.tz(dateString, fromTimezone);

    // Convert to target timezone and format
    return dateInSourceTz.tz(toTimezone).format('YYYY-MM-DD HH:mm:ss');
  } catch (error) {
    throw new Error(`Failed to convert date between timezones: ${error.message}`);
  }
};

module.exports = {
  getLocalNow,
  getTestDateRange,
  convertDateToUTC,
  convertDateBetweenTimezones,
};
