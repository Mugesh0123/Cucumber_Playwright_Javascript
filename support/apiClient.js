const axios = require('axios');
const Joi = require('joi');
const winston = require('winston');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../env.config') });

class ApiClient {
  constructor(baseURL, options = {}) {
    this.baseURL = baseURL || process.env.API_BASE_URL;
    this.logger = this.setupLogger();
    this.rateLimitQueue = [];
    this.rateLimitDelay = parseInt(process.env.API_RATE_LIMIT) || 100;
    this.retryAttempts = parseInt(process.env.API_RETRY_ATTEMPTS) || 3;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: parseInt(process.env.API_TIMEOUT) || 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Automation-Framework/2.0.0',
        ...options.headers
      }
    });

    this.setupInterceptors();
    this.setupAuthentication(options.auth);
  }

  setupLogger() {
    const logDir = process.env.LOG_FILE_PATH || './logs';
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    return winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'api-client' },
      transports: [
        new winston.transports.File({ 
          filename: path.join(logDir, 'api-error.log'), 
          level: 'error' 
        }),
        new winston.transports.File({ 
          filename: path.join(logDir, 'api-combined.log') 
        }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });
  }

  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        // Rate limiting
        await this.handleRateLimit();
        
        // Log request
        this.logger.info(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
          headers: config.headers,
          data: config.data
        });
        
        return config;
      },
      (error) => {
        this.logger.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        this.logger.info(`API Response: ${response.status} ${response.config.url}`, {
          status: response.status,
          statusText: response.statusText,
          data: response.data
        });
        return response;
      },
      async (error) => {
        this.logger.error('API Response Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });

        // Retry logic for specific errors
        if (this.shouldRetry(error) && error.config && !error.config._retry) {
          return this.retryRequest(error.config);
        }

        return Promise.reject(error);
      }
    );
  }

  setupAuthentication(authConfig) {
    if (authConfig) {
      switch (authConfig.type) {
        case 'bearer':
          this.client.defaults.headers.common['Authorization'] = `Bearer ${authConfig.token}`;
          break;
        case 'basic':
          const credentials = Buffer.from(`${authConfig.username}:${authConfig.password}`).toString('base64');
          this.client.defaults.headers.common['Authorization'] = `Basic ${credentials}`;
          break;
        case 'api-key':
          this.client.defaults.headers.common['X-API-Key'] = authConfig.key;
          break;
        case 'custom':
          Object.assign(this.client.defaults.headers.common, authConfig.headers);
          break;
      }
    }
  }

  async handleRateLimit() {
    const now = Date.now();
    this.rateLimitQueue = this.rateLimitQueue.filter(time => now - time < 1000);
    
    if (this.rateLimitQueue.length >= this.rateLimitDelay) {
      const oldestRequest = this.rateLimitQueue[0];
      const waitTime = 1000 - (now - oldestRequest);
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    this.rateLimitQueue.push(now);
  }

  shouldRetry(error) {
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    const retryableErrors = ['ECONNRESET', 'ENOTFOUND', 'ETIMEDOUT'];
    
    return (
      retryableStatuses.includes(error.response?.status) ||
      retryableErrors.includes(error.code) ||
      error.message.includes('timeout')
    );
  }

  async retryRequest(config) {
    config._retry = true;
    config._retryCount = (config._retryCount || 0) + 1;
    
    if (config._retryCount > this.retryAttempts) {
      throw new Error(`Max retry attempts (${this.retryAttempts}) exceeded`);
    }
    
    const delay = Math.pow(2, config._retryCount) * 1000; // Exponential backoff
    await new Promise(resolve => setTimeout(resolve, delay));
    
    this.logger.info(`Retrying request (attempt ${config._retryCount}): ${config.method} ${config.url}`);
    return this.client(config);
  }

  // HTTP Methods
  async get(endpoint, options = {}) {
    try {
      const response = await this.client.get(endpoint, options);
      return this.validateResponse(response, options.schema);
    } catch (error) {
      throw this.handleError(error, 'GET', endpoint);
    }
  }

  async post(endpoint, data, options = {}) {
    try {
      const response = await this.client.post(endpoint, data, options);
      return this.validateResponse(response, options.schema);
    } catch (error) {
      throw this.handleError(error, 'POST', endpoint);
    }
  }

  async put(endpoint, data, options = {}) {
    try {
      const response = await this.client.put(endpoint, data, options);
      return this.validateResponse(response, options.schema);
    } catch (error) {
      throw this.handleError(error, 'PUT', endpoint);
    }
  }

  async patch(endpoint, data, options = {}) {
    try {
      const response = await this.client.patch(endpoint, data, options);
      return this.validateResponse(response, options.schema);
    } catch (error) {
      throw this.handleError(error, 'PATCH', endpoint);
    }
  }

  async delete(endpoint, options = {}) {
    try {
      const response = await this.client.delete(endpoint, options);
      return this.validateResponse(response, options.schema);
    } catch (error) {
      throw this.handleError(error, 'DELETE', endpoint);
    }
  }

  // File Upload
  async uploadFile(endpoint, filePath, fieldName = 'file', additionalData = {}) {
    try {
      const FormData = require('form-data');
      const form = new FormData();
      
      form.append(fieldName, fs.createReadStream(filePath));
      
      // Add additional data
      Object.keys(additionalData).forEach(key => {
        form.append(key, additionalData[key]);
      });
      
      const response = await this.client.post(endpoint, form, {
        headers: {
          ...form.getHeaders(),
          ...this.client.defaults.headers.common
        }
      });
      
      return this.validateResponse(response);
    } catch (error) {
      throw this.handleError(error, 'POST', endpoint);
    }
  }

  // Download File
  async downloadFile(endpoint, outputPath, options = {}) {
    try {
      const response = await this.client.get(endpoint, {
        ...options,
        responseType: 'stream'
      });
      
      const writer = fs.createWriteStream(outputPath);
      response.data.pipe(writer);
      
      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          this.logger.info(`File downloaded: ${outputPath}`);
          resolve(outputPath);
        });
        writer.on('error', reject);
      });
    } catch (error) {
      throw this.handleError(error, 'GET', endpoint);
    }
  }

  // Response Validation
  validateResponse(response, schema) {
    if (schema) {
      const { error, value } = schema.validate(response.data);
      if (error) {
        throw new Error(`Response validation failed: ${error.details[0].message}`);
      }
      return value;
    }
    return response.data;
  }

  // Error Handling
  handleError(error, method, endpoint) {
    const apiError = new Error(`API ${method} ${endpoint} failed`);
    apiError.originalError = error;
    apiError.status = error.response?.status;
    apiError.statusText = error.response?.statusText;
    apiError.data = error.response?.data;
    apiError.config = error.config;
    
    return apiError;
  }

  // Authentication Methods
  async login(credentials) {
    try {
      const response = await this.post('/auth/login', credentials);
      if (response.token) {
        this.client.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;
        this.logger.info('Authentication successful');
      }
      return response;
    } catch (error) {
      this.logger.error('Authentication failed:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await this.post('/auth/logout');
      delete this.client.defaults.headers.common['Authorization'];
      this.logger.info('Logout successful');
    } catch (error) {
      this.logger.error('Logout failed:', error);
      throw error;
    }
  }

  // Health Check
  async healthCheck() {
    try {
      const response = await this.get('/health');
      this.logger.info('Health check passed:', response);
      return response;
    } catch (error) {
      this.logger.error('Health check failed:', error);
      throw error;
    }
  }

  // Performance Testing
  async measureResponseTime(endpoint, method = 'GET', data = null) {
    const startTime = Date.now();
    try {
      let response;
      switch (method.toUpperCase()) {
        case 'GET':
          response = await this.get(endpoint);
          break;
        case 'POST':
          response = await this.post(endpoint, data);
          break;
        case 'PUT':
          response = await this.put(endpoint, data);
          break;
        case 'DELETE':
          response = await this.delete(endpoint);
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }
      
      const responseTime = Date.now() - startTime;
      this.logger.info(`Response time for ${method} ${endpoint}: ${responseTime}ms`);
      
      return {
        response,
        responseTime,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.logger.error(`Request failed after ${responseTime}ms:`, error);
      throw error;
    }
  }

  // Batch Requests
  async batchRequests(requests) {
    const results = [];
    const errors = [];
    
    for (const request of requests) {
      try {
        const result = await this[request.method.toLowerCase()](
          request.endpoint,
          request.data,
          request.options
        );
        results.push({ success: true, data: result });
      } catch (error) {
        errors.push({ success: false, error: error.message });
      }
    }
    
    return { results, errors, total: requests.length };
  }

  // WebSocket Support (if needed)
  async createWebSocketConnection(endpoint) {
    const WebSocket = require('ws');
    const wsUrl = this.baseURL.replace('http', 'ws') + endpoint;
    
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(wsUrl);
      
      ws.on('open', () => {
        this.logger.info('WebSocket connection established');
        resolve(ws);
      });
      
      ws.on('error', (error) => {
        this.logger.error('WebSocket connection failed:', error);
        reject(error);
      });
    });
  }

  // Utility Methods
  setAuthToken(token) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  setApiKey(key) {
    this.client.defaults.headers.common['X-API-Key'] = key;
  }

  setCustomHeader(name, value) {
    this.client.defaults.headers.common[name] = value;
  }

  getRequestCount() {
    return this.rateLimitQueue.length;
  }

  resetRateLimit() {
    this.rateLimitQueue = [];
  }
}

module.exports = ApiClient; 