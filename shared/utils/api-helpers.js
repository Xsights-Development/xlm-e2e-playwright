// shared/utils/api-helpers.js

/**
 * API Helper Functions
 * Useful for API testing hoặc setup/teardown test data
 */

const https = require('https');
const http = require('http');

/**
 * Make HTTP request
 */
async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData,
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

/**
 * GET request
 */
async function get(url, headers = {}) {
  return await makeRequest(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

/**
 * POST request
 */
async function post(url, body, headers = {}) {
  return await makeRequest(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body,
  });
}

/**
 * PUT request
 */
async function put(url, body, headers = {}) {
  return await makeRequest(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body,
  });
}

/**
 * DELETE request
 */
async function del(url, headers = {}) {
  return await makeRequest(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

module.exports = {
  makeRequest,
  get,
  post,
  put,
  del,
};