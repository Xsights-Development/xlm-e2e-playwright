const { env } = require('../env');

/**
 * Base API helper with common methods
 */
class BaseAPI {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

/**
 * Admin API - For admin operations via API with authentication
 */
class AdminAPIClient extends BaseAPI {
  constructor(baseURL) {
    super(baseURL);
    this.token = null;
    this.tokenExpiry = null;
  }

  /**
   * Login to admin API and get authentication token
   * @returns {Promise<string>} Authentication token
   */
  async login() {
    try {
      const response = await fetch(`${this.baseURL}/auth/form/login/api`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: env.ADMIN_USER,
          password: env.ADMIN_PASS,
        }),
      });

      if (!response.ok) {
        throw new Error(`Admin login failed: ${response.status} ${response.statusText}`);
      }

      const res = await response.json();
      this.token = res?.data?.access_token;

      if (!this.token) {
        throw new Error('No token received from admin login');
      }

      const expiredIn = res?.data?.expiresIn || 3600;

      // Set token expiry (assume 1 hour if not provided)
      this.tokenExpiry = Date.now() + expiredIn * 1000;

      console.log('✓ Admin API authenticated successfully');
      return this.token;
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    }
  }

  /**
   * Check if token is valid and not expired
   * @returns {boolean}
   */
  isTokenValid() {
    return this.token && this.tokenExpiry && Date.now() < this.tokenExpiry;
  }

  /**
   * Ensure we have a valid token, login if needed
   */
  async ensureAuthenticated() {
    if (!this.isTokenValid()) {
      await this.login();
    }
  }

  /**
   * Override request method to include authentication
   */
  async request(endpoint, options = {}) {
    await this.ensureAuthenticated();

    const url = `${this.baseURL}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
        ...options.headers,
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      // If unauthorized, try to re-login once
      if (response.status === 401) {
        this.token = null;
        await this.login();
        // Retry the request
        return this.request(endpoint, options);
      }

      throw new Error(`Admin API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get list of animals
   * @param {Object} params - Query parameters (page, perPage, orderBy, orderDir)
   * @returns {Promise<Object>} Animals list with pagination
   */
  async getAnimals(params = {}) {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      perPage: params.perPage || 10,
      orderBy: params.orderBy || '',
      orderDir: params.orderDir || '',
      ...params,
    });

    return this.get(`/AnimalGroupAdmin/AnimalAdmin/list?${queryParams}`);
  }

  /**
   * Get animal by ID
   * @param {string|number} animalId - Animal ID
   * @returns {Promise<Object>} Animal details
   */
  async getAnimal(animalId) {
    return this.get(`/AnimalGroupAdmin/AnimalAdmin/${animalId}`);
  }

  /**
   * Get list of locations
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Locations list
   */
  async getLocations(params = {}) {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      perPage: params.perPage || 10,
      ...params,
    });

    return this.get(`/LocationAdmin/list?${queryParams}`);
  }

  /**
   * Get list of users
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Users list
   */
  async getUsers(params = {}) {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      perPage: params.perPage || 10,
      ...params,
    });

    return this.get(`/UserAdmin/list?${queryParams}`);
  }

  /**
   * Get weekly inventory tracking data
   * @param {Object} filters - Filter parameters
   * @param {string} filters.locationId - Location ID (e.g., 'nursery-2', 'f-nov23')
   * @param {string} filters.startDate - Start date (e.g., '2025-11-03 00:00:00')
   * @param {string} filters.endDate - End date (e.g., '2025-11-30 23:59:59')
   * @param {string} filters.client - Client filter (optional)
   * @param {string} filters.farm - Farm filter (optional)
   * @param {number} filters.page - Page number (default: 1)
   * @param {number} filters.perPage - Items per page (default: 10)
   * @returns {Promise<Object>} Weekly inventory tracking data
   */
  async getWeeklyInventoryTracking(filters = {}) {
    const queryParams = new URLSearchParams({
      page: filters.page || 1,
      perPage: filters.perPage || 10,
      orderBy: filters.orderBy || '',
      orderDir: filters.orderDir || '',
    });

    const payload = {
      _replace: '1',
      page: filters.page || 1,
      timestamp: `[-]${filters.startDate || '2025-11-03 00:00:00'},${filters.endDate || '2025-11-30 23:59:59'}`,
      client: filters.client || '',
      farm: filters.farm || '',
      location_id: filters.locationId || '',
      perPage: filters.perPage || 10,
    };

    return this.post(`/snowflake/WeeklyInventoryTrackingAdmin/list?${queryParams}`, payload);
  }

  /**
   * Logout and clear token
   */
  async logout() {
    this.token = null;
    this.tokenExpiry = null;
    console.log('✓ Admin API logged out');
  }
}

const AdminAPI = new AdminAPIClient(env.ADMIN_API_URL);
const AppAPI = new BaseAPI(env.APP_URL);

module.exports = { AdminAPI, AppAPI };
