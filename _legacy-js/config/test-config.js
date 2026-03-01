require('dotenv').config();
/**
 * Test Configuration
 * Centralized test data loaded from environment variables
 *
 * Usage:
 *   const testConfig = require('../config/test-config');
 *   console.log(testConfig.credentials.username);
 *   console.log(testConfig.organization.tenant);
 *   console.log(testConfig.location.name);
 *
 * Environment Variables Required:
 *   - APP_USER: User email/username
 *   - APP_PASS: User password
 *   - APP_TENANT or APP_TENANT_IDENTIFIER: Tenant identifier (selection uses identifier)
 *   - APP_FARM or APP_FARM_IDENTIFIER: Farm identifier (selection uses identifier)
 *   - APP_LOCATION_TYPE: Location/barn group type (e.g., "general")
 *   - APP_LOCATION_NAME: Location/barn name
 *   - APP_LOCATION_IDENTIFIER: Location identifier/code
 */

const prefix = 'APP';
// Required environment variables
const REQUIRED_ENV_VARS = [
  `${prefix}_USER`,
  `${prefix}_PASS`,
  `${prefix}_TENANT`,
  `${prefix}_FARM`,
  `${prefix}_LOCATION_TYPE`,
  `${prefix}_LOCATION_NAME`,
  `${prefix}_LOCATION_IDENTIFIER`
];

/**
 * Validate that all required environment variables are set
 * @throws {Error} If any required environment variable is missing
 */
function validateEnvironment() {
  const missing = REQUIRED_ENV_VARS.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('\n❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\n💡 Please check your .env file');
    console.error('   Copy .env.example to .env and fill in the values\n');
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
}

// Validate on module load
validateEnvironment();

/**
 * Test Configuration Object
 * All values are loaded from environment variables
 */
const testConfig = {
  /**
   * User credentials
   */
  credentials: {
    username: process.env.APP_USER,
    password: process.env.APP_PASS,
  },

  /**
   * Organization data (selection uses identifier)
   */
  organization: {
    tenant: process.env.APP_TENANT,
    farm: process.env.APP_FARM,
    tenantIdentifier: process.env.APP_TENANT_IDENTIFIER ?? process.env.APP_TENANT,
    farmIdentifier: process.env.APP_FARM_IDENTIFIER ?? process.env.APP_FARM,
  },

  /**
   * Location data
   */
  location: {
    type: process.env.APP_LOCATION_TYPE,
    name: process.env.APP_LOCATION_NAME,
    identifier: process.env.APP_LOCATION_IDENTIFIER,
  },

  /**
   * Legacy format for backward compatibility
   * @deprecated Use specific properties instead (credentials, organization, location)
   */
  get username() { return this.credentials.username; },
  get password() { return this.credentials.password; },
  get tenant() { return this.organization.tenant; },
  get farm() { return this.organization.farm; },
  get tenantIdentifier() { return this.organization.tenantIdentifier; },
  get farmIdentifier() { return this.organization.farmIdentifier; },
  get locationCategory() { return this.location.type; },
  get locationName() { return this.location.name; },
  get locationIdentifier() { return this.location.identifier; },
};

module.exports = testConfig;
