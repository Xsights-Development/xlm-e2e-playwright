const moment = require('moment');

/**
 * Format CubeJS inventory tracking data for easy comparison and logging
 * @param {Array} cubeData - Raw CubeJS response data
 * @param {Object} fieldMapping - Optional custom field mapping
 * @returns {Array} Formatted data with simplified field names
 */
const formatCubeJSData = (cubeData, fieldMapping = null) => {
  if (!cubeData || !Array.isArray(cubeData) || !fieldMapping) {
    return [];
  }

  return cubeData.map(item => {
    const formatted = {};
    for (const [key, sourcePath] of Object.entries(fieldMapping)) {
      formatted[key] = item[sourcePath];
    }
    return formatted;
  });
};

/**
 * Format Admin API inventory tracking data to match CubeJS format
 * Converts timestamp to ISO week start (Monday) for comparison
 * @param {Array} adminData - Raw Admin API response items
 * @param {Object} options - Optional formatting options
 * @param {Object} options.fieldMapping - Custom field mapping {outputField: inputField}
 * @param {boolean} options.convertToIsoWeek - Whether to convert timestamp to ISO week start (default: true)
 * @returns {Array} Formatted data matching CubeJS structure
 */
const formatAdminAPIData = (adminData, options = {}) => {
  if (!adminData || !Array.isArray(adminData) || !options.fieldMapping) {
    return [];
  }

  const convertToIsoWeek = options.convertToIsoWeek !== false; // Default to true

  return adminData.map(item => {
    const formatted = {};

    for (const [outputField, inputField] of Object.entries(options.fieldMapping)) {
      // Special handling for timestamp.week - convert to ISO week start
      if (outputField === 'timestamp.week' && convertToIsoWeek) {
        const timestamp = moment(item[inputField]);
        formatted[outputField] = timestamp.clone().startOf('isoWeek').format('YYYY-MM-DDTHH:mm:ss.SSS');
      } else {
        formatted[outputField] = item[inputField];
      }
    }

    return formatted;
  });
};

/**
 * Sort data by timestamp field in ascending order (oldest to newest)
 * Generic function that works with any data structure
 * @param {Array} data - Data array to sort
 * @param {string} timestampField - The field name containing the timestamp value
 * @returns {Array} Sorted data array
 */
const sortDataByTimestamp = (data, timestampField) => {
  if (!data || !Array.isArray(data)) {
    return [];
  }

  if (!timestampField) {
    throw new Error('timestampField parameter is required for sortDataByTimestamp');
  }

  return [...data].sort((a, b) => {
    const timeA = new Date(a[timestampField]).getTime();
    const timeB = new Date(b[timestampField]).getTime();
    return timeA - timeB;
  });
};

/**
 * Log formatted data with a custom label
 * @param {string} label - Label to display
 * @param {Array} formattedData - Formatted data to log
 */
const logFormattedData = (label, formattedData) => {
  const separator = '='.repeat(label.length + 20);
  console.log(separator);
  console.log(`      ${label}`);
  console.log(separator);
  console.log(JSON.stringify(formattedData, null, 2));
  console.log(separator);
};

module.exports = {
  formatCubeJSData,
  formatAdminAPIData,
  sortDataByTimestamp,
  logFormattedData,
};
