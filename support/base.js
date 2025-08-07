const { chromium, firefox, webkit, devices } = require('@playwright/test');
const axios = require('axios');
const winston = require('winston');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../env.config') });

class Base {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.browserType = process.env.BROWSER || 'chromium';
    this.headless = process.env.HEADLESS !== 'false';
    this.baseURL = process.env.BASE_URL || 'https://demowebshop.tricentis.com';
    this.apiBaseURL = process.env.API_BASE_URL;
    this.setupLogger();
    this.setupApiClient();
  }

  setupLogger() {
    const logDir = process.env.LOG_FILE_PATH || './logs';
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'automation-framework' },
      transports: [
        new winston.transports.File({ 
          filename: path.join(logDir, 'error.log'), 
          level: 'error' 
        }),
        new winston.transports.File({ 
          filename: path.join(logDir, 'combined.log') 
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

  setupApiClient() {
    this.apiClient = axios.create({
      baseURL: this.apiBaseURL,
      timeout: parseInt(process.env.API_TIMEOUT) || 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Automation-Framework/2.0.0'
      }
    });

    // Request interceptor
    this.apiClient.interceptors.request.use(
      (config) => {
        this.logger.info(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.apiClient.interceptors.response.use(
      (response) => {
        this.logger.info(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        this.logger.error('API Response Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  async initializeBrowser(options = {}) {
    try {
      const browserOptions = {
        headless: options.headless !== undefined ? options.headless : this.headless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      };

      // Add device emulation if specified
      if (options.device) {
        const deviceConfig = devices[options.device];
        if (deviceConfig) {
          browserOptions.deviceScaleFactor = deviceConfig.deviceScaleFactor;
          browserOptions.isMobile = deviceConfig.isMobile;
          browserOptions.hasTouch = deviceConfig.hasTouch;
        }
      }

      switch (this.browserType.toLowerCase()) {
        case 'firefox':
          this.browser = await firefox.launch(browserOptions);
          break;
        case 'webkit':
          this.browser = await webkit.launch(browserOptions);
          break;
        default:
          this.browser = await chromium.launch(browserOptions);
      }

      const contextOptions = {
        viewport: {
          width: parseInt(process.env.VIEWPORT_WIDTH) || 1280,
          height: parseInt(process.env.VIEWPORT_HEIGHT) || 720
        },
        ignoreHTTPSErrors: true,
        recordVideo: process.env.VIDEO_ON_FAILURE === 'true' ? {
          dir: process.env.VIDEO_PATH || './reports/videos'
        } : undefined,
        recordHar: process.env.TRACE_ON_FAILURE === 'true' ? {
          path: path.join(process.env.TRACE_PATH || './reports/traces', 'trace.har')
        } : undefined,
        userAgent: process.env.USER_AGENT
      };

      this.context = await this.browser.newContext(contextOptions);
      this.page = await this.context.newPage();
      
      // Set default timeout
      await this.page.setDefaultTimeout(parseInt(process.env.TIMEOUT) || 30000);
      
      // Enable performance monitoring
      await this.page.addInitScript(() => {
        window.performance.mark = window.performance.mark || function() {};
        window.performance.measure = window.performance.measure || function() {};
      });

      this.logger.info(`Browser ${this.browserType} initialized successfully`);
    } catch (error) {
      this.logger.error('Failed to initialize browser:', error);
      throw error;
    }
  }

  async navigateTo(url, options = {}) {
    try {
      const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
      const navigationOptions = {
        waitUntil: 'networkidle',
        ...options
      };
      
      await this.page.goto(fullUrl, navigationOptions);
      this.logger.info(`Navigated to: ${fullUrl}`);
      
      // Wait for page to be fully loaded
      await this.page.waitForLoadState('domcontentloaded');
    } catch (error) {
      this.logger.error('Navigation failed:', error);
      throw error;
    }
  }

  async takeScreenshot(name, options = {}) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const screenshotPath = path.join(
        process.env.SCREENSHOT_PATH || './reports/screenshots',
        `${name}_${timestamp}.png`
      );
      
      const screenshotOptions = {
        path: screenshotPath,
        fullPage: true,
        ...options
      };
      
      await this.page.screenshot(screenshotOptions);
      this.logger.info(`Screenshot saved: ${screenshotPath}`);
      return screenshotPath;
    } catch (error) {
      this.logger.error('Screenshot failed:', error);
      return null;
    }
  }

  async closeBrowser() {
    try {
      if (this.context) {
        await this.context.close();
      }
      if (this.browser) {
        await this.browser.close();
      }
      this.logger.info('Browser closed successfully');
    } catch (error) {
      this.logger.error('Failed to close browser:', error);
    }
  }

  async waitForElement(selector, timeout = 10000) {
    try {
      await this.page.waitForSelector(selector, { timeout });
      return await this.page.locator(selector);
    } catch (error) {
      this.logger.error(`Element not found: ${selector}`, error);
      throw error;
    }
  }

  async isElementVisible(selector) {
    try {
      const element = await this.page.locator(selector);
      return await element.isVisible();
    } catch (error) {
      return false;
    }
  }

  async getElementText(selector) {
    try {
      const element = await this.page.locator(selector);
      return await element.textContent();
    } catch (error) {
      this.logger.error(`Failed to get text from: ${selector}`, error);
      return '';
    }
  }

  async getCurrentUrl() {
    return await this.page.url();
  }

  async getPageTitle() {
    return await this.page.title();
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async refreshPage() {
    await this.page.reload();
    await this.waitForPageLoad();
  }

  async goBack() {
    await this.page.goBack();
    await this.waitForPageLoad();
  }

  async goForward() {
    await this.page.goForward();
    await this.waitForPageLoad();
  }

  // API Testing Methods
  async apiGet(endpoint, options = {}) {
    try {
      const response = await this.apiClient.get(endpoint, options);
      return response.data;
    } catch (error) {
      this.logger.error(`API GET failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async apiPost(endpoint, data, options = {}) {
    try {
      const response = await this.apiClient.post(endpoint, data, options);
      return response.data;
    } catch (error) {
      this.logger.error(`API POST failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async apiPut(endpoint, data, options = {}) {
    try {
      const response = await this.apiClient.put(endpoint, data, options);
      return response.data;
    } catch (error) {
      this.logger.error(`API PUT failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async apiDelete(endpoint, options = {}) {
    try {
      const response = await this.apiClient.delete(endpoint, options);
      return response.data;
    } catch (error) {
      this.logger.error(`API DELETE failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Performance Testing Methods
  async measurePageLoadTime() {
    try {
      const navigationTiming = await this.page.evaluate(() => {
        const timing = performance.timing;
        return {
          loadTime: timing.loadEventEnd - timing.navigationStart,
          domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
          firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
          firstContentfulPaint: performance.getEntriesByType('paint')[1]?.startTime || 0
        };
      });
      
      this.logger.info('Page load performance:', navigationTiming);
      return navigationTiming;
    } catch (error) {
      this.logger.error('Failed to measure page load time:', error);
      return null;
    }
  }

  async runLighthouseAudit() {
    try {
      const lighthouse = require('lighthouse');
      const chromeLauncher = require('chrome-launcher');
      
      const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
      const options = {
        logLevel: 'info',
        output: 'json',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
      };
      
      const runnerResult = await lighthouse(this.page.url(), options, null);
      const reportResults = runnerResult.lhr;
      
      await chrome.kill();
      
      this.logger.info('Lighthouse audit completed:', {
        performance: reportResults.categories.performance.score * 100,
        accessibility: reportResults.categories.accessibility.score * 100,
        bestPractices: reportResults.categories['best-practices'].score * 100,
        seo: reportResults.categories.seo.score * 100
      });
      
      return reportResults;
    } catch (error) {
      this.logger.error('Lighthouse audit failed:', error);
      return null;
    }
  }

  // Accessibility Testing Methods
  async runAccessibilityAudit() {
    try {
      const { AxeBuilder } = require('@axe-core/playwright');
      const results = await new AxeBuilder({ page: this.page }).analyze();
      
      this.logger.info('Accessibility audit completed:', {
        violations: results.violations.length,
        passes: results.passes.length,
        incomplete: results.incomplete.length
      });
      
      return results;
    } catch (error) {
      this.logger.error('Accessibility audit failed:', error);
      return null;
    }
  }

  // Visual Testing Methods
  async captureBaseline(name) {
    try {
      const baselinePath = path.join(process.env.VISUAL_BASELINE_PATH || './baselines', `${name}.png`);
      await this.takeScreenshot(name, { path: baselinePath });
      this.logger.info(`Baseline captured: ${baselinePath}`);
      return baselinePath;
    } catch (error) {
      this.logger.error('Failed to capture baseline:', error);
      return null;
    }
  }

  async compareWithBaseline(name, tolerance = 0.1) {
    try {
      const baselinePath = path.join(process.env.VISUAL_BASELINE_PATH || './baselines', `${name}.png`);
      const currentPath = await this.takeScreenshot(`${name}_current`);
      
      if (!fs.existsSync(baselinePath)) {
        this.logger.warn(`Baseline not found: ${baselinePath}`);
        return { match: false, difference: 1 };
      }
      
      const pixelmatch = require('pixelmatch');
      const PNG = require('pngjs').PNG;
      
      const baseline = PNG.sync.read(fs.readFileSync(baselinePath));
      const current = PNG.sync.read(fs.readFileSync(currentPath));
      
      const { width, height } = baseline;
      const diff = new PNG({ width, height });
      
      const numDiffPixels = pixelmatch(baseline.data, current.data, diff.data, width, height, {
        threshold: tolerance
      });
      
      const match = numDiffPixels === 0;
      const difference = numDiffPixels / (width * height);
      
      this.logger.info(`Visual comparison result: ${match ? 'MATCH' : 'MISMATCH'} (${(difference * 100).toFixed(2)}% difference)`);
      
      return { match, difference, diffPath: currentPath };
    } catch (error) {
      this.logger.error('Visual comparison failed:', error);
      return { match: false, difference: 1 };
    }
  }

  // Utility Methods
  async waitForNetworkIdle(timeout = 5000) {
    try {
      await this.page.waitForLoadState('networkidle', { timeout });
    } catch (error) {
      this.logger.warn('Network idle timeout reached');
    }
  }

  async scrollToElement(selector) {
    try {
      const element = await this.page.locator(selector);
      await element.scrollIntoViewIfNeeded();
    } catch (error) {
      this.logger.error(`Failed to scroll to element: ${selector}`, error);
    }
  }

  async waitForElementToBeStable(selector, timeout = 5000) {
    try {
      await this.page.waitForFunction(
        (sel) => {
          const element = document.querySelector(sel);
          return element && element.offsetWidth > 0 && element.offsetHeight > 0;
        },
        selector,
        { timeout }
      );
    } catch (error) {
      this.logger.error(`Element not stable: ${selector}`, error);
      throw error;
    }
  }

  getLogger() {
    return this.logger;
  }

  getApiClient() {
    return this.apiClient;
  }
}

module.exports = Base; 