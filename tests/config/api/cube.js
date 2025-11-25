const cubejs = require('@cubejs-client/core').default;
const { env } = require('../env');

const cube = cubejs(env.CUBE_API_TOKEN, { apiUrl: env.CUBE_API_URL });

/**
 * CubeJS API - For analytics and reporting queries
 */
const CubeAPI = {
  /**
   * Load data from CubeJS with query configuration
   * @param {Object} query - CubeJS query object
   * @param {Object} options - Additional options (headers, etc.)
   * @returns {Promise<Array>} Query results
   */
  async load(query, options = {}) {
    const defaultOptions = {
      headers: {
        Authorization: env.CUBE_API_TOKEN,
        ...options.headers,
      },
    };

    try {
      const result = await cube.load(query, defaultOptions);

      // Handle different response formats from CubeJS
      if (result?.data) {
        return result.data;
      }

      if (result?.loadResponse?.results?.[0]?.data) {
        return result.loadResponse.results[0].data;
      }

      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('CubeJS query failed:', error);
      throw error;
    }
  },

  /**
   * Query inventory tracking data
   * @param {Object} filters - Query filters (location_id, date range, etc.)
   * @param {Object} options - Additional query options
   * @returns {Promise<Array>} Inventory data
   */
  async getInventoryTracking(filters = {}, options = {}) {
    const query = {
      measures: [
        'snowflake_inventory_tracking.sum_new_tags_onboarded',
        'snowflake_inventory_tracking.sum_existing_active_tags',
        'snowflake_inventory_tracking.sum_undetected_tags',
      ],
      timeDimensions: [
        {
          dimension: 'snowflake_inventory_tracking.timestamp',
          granularity: filters.granularity || 'week',
          ...(filters.dateRange && { dateRange: filters.dateRange }),
        },
      ],
      filters: [],
      order: {
        'snowflake_inventory_tracking.timestamp': 'asc',
      },
      limit: filters.limit || 100,
      ...options,
    };

    if (filters.timezone) {
      query.timezone = filters.timezone;
    }

    // Add location filter if provided
    if (filters.locationId) {
      query.filters.push({
        member: 'snowflake_inventory_tracking.location_id',
        operator: 'equals',
        values: [filters.locationId],
      });
    }

    // Add custom date range filter if provided
    if (filters.startDate && filters.endDate) {
      query.filters.push({
        member: 'snowflake_inventory_tracking.timestamp',
        operator: 'inDateRange',
        values: [filters.startDate, filters.endDate],
      });
    }

    return this.load(query);
  },

  /**
   * Get tags deployed data for a specific location
   * @param {string} locationId - Location identifier
   * @param {Object} options - Query options (dateRange, timezone, etc.)
   * @returns {Promise<Array>} Tags deployed data
   */
  async getTagsDeployed(locationId, options = {}) {
    return this.getInventoryTracking({
      locationId,
      ...options,
    });
  },
};

module.exports = { CubeAPI };

