const { Before, After, AfterAll, BeforeAll } = require('@cucumber/cucumber');
const Base = require('./base');
const path = require('path');
const fs = require('fs');
const winston = require('winston');

// Global test data and state
let globalTestData = {
  startTime: null,
  totalScenarios: 0,
  passedScenarios: 0,
  failedScenarios: 0,
  performanceMetrics: [],
  screenshots: [],
  videos: []
};

// Setup global logger
const setupGlobalLogger = () => {
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
    defaultMeta: { service: 'test-execution' },
    transports: [
      new winston.transports.File({ 
        filename: path.join(logDir, 'test-execution.log') 
      }),
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      })
    ]
  });
};

const globalLogger = setupGlobalLogger();

BeforeAll(async function () {
  globalTestData.startTime = new Date();
  globalLogger.info('🚀 Test execution started', {
    timestamp: globalTestData.startTime,
    environment: process.env.NODE_ENV,
    browser: process.env.BROWSER,
    baseUrl: process.env.BASE_URL
  });

  // Create necessary directories
  const directories = [
    process.env.REPORT_PATH || './reports',
    process.env.SCREENSHOT_PATH || './reports/screenshots',
    process.env.VIDEO_PATH || './reports/videos',
    process.env.TRACE_PATH || './reports/traces',
    process.env.ALLURE_RESULTS_PATH || './reports/allure-results',
    process.env.PERFORMANCE_RESULTS_PATH || './reports/performance',
    process.env.VISUAL_BASELINE_PATH || './baselines',
    process.env.LOG_FILE_PATH || './logs'
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Validate environment configuration
  const requiredEnvVars = ['BASE_URL', 'BROWSER', 'TIMEOUT'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    globalLogger.warn('Missing environment variables:', missingVars);
  }

  // Check system resources
  const os = require('os');
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const memoryUsage = ((totalMemory - freeMemory) / totalMemory * 100).toFixed(2);

  globalLogger.info('System resources check', {
    totalMemory: `${(totalMemory / 1024 / 1024 / 1024).toFixed(2)} GB`,
    freeMemory: `${(freeMemory / 1024 / 1024 / 1024).toFixed(2)} GB`,
    memoryUsage: `${memoryUsage}%`,
    cpuCores: os.cpus().length
  });

  if (parseFloat(memoryUsage) > 90) {
    globalLogger.warn('High memory usage detected. Consider closing other applications.');
  }
});

Before(async function (scenario) {
  globalTestData.totalScenarios++;
  
  // Initialize test context
  this.scenarioName = scenario.pickle.name;
  this.scenarioTags = scenario.pickle.tags.map(tag => tag.name);
  this.testStartTime = Date.now();
  
  globalLogger.info(`📋 Starting scenario: ${this.scenarioName}`, {
    tags: this.scenarioTags,
    timestamp: new Date().toISOString()
  });

  // Initialize base class with enhanced options
  const browserOptions = {
    headless: process.env.HEADLESS !== 'false',
    device: this.scenarioTags.includes('@mobile') ? 'iPhone 12' : 
           this.scenarioTags.includes('@tablet') ? 'iPad Pro' : undefined
  };

  this.base = new Base();
  await this.base.initializeBrowser(browserOptions);
  
  // Set up page and webElements
  this.page = this.base.page;
  this.webElements = this.base.webElements;
  
  // Initialize API client if needed
  if (this.scenarioTags.includes('@api')) {
    this.apiClient = this.base.getApiClient();
  }

  // Set up performance monitoring
  this.performanceMetrics = {
    pageLoadTimes: [],
    apiResponseTimes: [],
    screenshotTimes: []
  };

  // Handle different test types
  if (this.scenarioTags.includes('@performance')) {
    await this.setupPerformanceMonitoring();
  }

  if (this.scenarioTags.includes('@accessibility')) {
    await this.setupAccessibilityTesting();
  }

  if (this.scenarioTags.includes('@visual')) {
    await this.setupVisualTesting();
  }

  // Set up custom timeouts for different test types
  if (this.scenarioTags.includes('@slow')) {
    await this.page.setDefaultTimeout(60000); // 60 seconds for slow tests
  } else if (this.scenarioTags.includes('@fast')) {
    await this.page.setDefaultTimeout(10000); // 10 seconds for fast tests
  }

  // Set up error handling
  this.page.on('pageerror', error => {
    globalLogger.error(`Page error in ${this.scenarioName}:`, error);
  });

  this.page.on('console', msg => {
    if (msg.type() === 'error') {
      globalLogger.error(`Console error in ${this.scenarioName}:`, msg.text());
    }
  });

  // Set up request/response monitoring
  this.page.on('request', request => {
    if (this.scenarioTags.includes('@debug')) {
      globalLogger.debug(`Request: ${request.method()} ${request.url()}`);
    }
  });

  this.page.on('response', response => {
    if (response.status() >= 400) {
      globalLogger.warn(`HTTP ${response.status()} for ${response.url()}`);
    }
  });
});

After(async function (scenario) {
  const testEndTime = Date.now();
  const testDuration = testEndTime - this.testStartTime;
  
  // Update global statistics
  if (scenario.result.status === 'PASSED') {
    globalTestData.passedScenarios++;
  } else {
    globalTestData.failedScenarios++;
  }

  // Capture performance metrics
  if (this.performanceMetrics) {
    globalTestData.performanceMetrics.push({
      scenario: this.scenarioName,
      duration: testDuration,
      metrics: this.performanceMetrics
    });
  }

  // Handle test failure
  if (scenario.result.status === 'FAILED') {
    await this.handleTestFailure(scenario);
  }

  // Capture final screenshot for all scenarios
  if (process.env.SCREENSHOT_ON_FAILURE === 'true' || 
      this.scenarioTags.includes('@screenshot')) {
    await this.captureFinalScreenshot(scenario);
  }

  // Generate performance report for performance tests
  if (this.scenarioTags.includes('@performance')) {
    await this.generatePerformanceReport();
  }

  // Generate accessibility report
  if (this.scenarioTags.includes('@accessibility')) {
    await this.generateAccessibilityReport();
  }

  // Clean up test data
  await this.cleanupTestData();

  // Close browser
  if (this.base) {
    await this.base.closeBrowser();
  }

  globalLogger.info(`✅ Completed scenario: ${this.scenarioName}`, {
    status: scenario.result.status,
    duration: `${testDuration}ms`,
    timestamp: new Date().toISOString()
  });
});

AfterAll(async function () {
  const endTime = new Date();
  const totalDuration = endTime - globalTestData.startTime;
  
  // Generate comprehensive test report
  await generateComprehensiveReport();
  
  // Generate performance summary
  await generatePerformanceSummary();
  
  // Send notifications if configured
  await sendTestNotifications();
  
  // Clean up temporary files
  await cleanupTemporaryFiles();
  
  globalLogger.info('🏁 Test execution completed', {
    totalScenarios: globalTestData.totalScenarios,
    passedScenarios: globalTestData.passedScenarios,
    failedScenarios: globalTestData.failedScenarios,
    successRate: `${((globalTestData.passedScenarios / globalTestData.totalScenarios) * 100).toFixed(2)}%`,
    totalDuration: `${totalDuration}ms`,
    timestamp: endTime.toISOString()
  });
});

// Helper methods
async function handleTestFailure(scenario) {
  try {
    // Capture failure screenshot
    const screenshotPath = await this.base.takeScreenshot(
      `failure_${this.scenarioName.replace(/\s+/g, '_')}`
    );
    
    if (screenshotPath) {
      globalTestData.screenshots.push(screenshotPath);
    }

    // Capture video if enabled
    if (process.env.VIDEO_ON_FAILURE === 'true') {
      const videoPath = await this.base.context.close();
      if (videoPath) {
        globalTestData.videos.push(videoPath);
      }
    }

    // Log detailed error information
    globalLogger.error(`❌ Test failed: ${this.scenarioName}`, {
      error: scenario.result.message,
      stack: scenario.result.exception,
      screenshot: screenshotPath,
      duration: Date.now() - this.testStartTime
    });

  } catch (error) {
    globalLogger.error('Failed to handle test failure:', error);
  }
}

async function captureFinalScreenshot(scenario) {
  try {
    const screenshotPath = await this.base.takeScreenshot(
      `final_${this.scenarioName.replace(/\s+/g, '_')}`
    );
    
    if (screenshotPath) {
      globalTestData.screenshots.push(screenshotPath);
    }
  } catch (error) {
    globalLogger.error('Failed to capture final screenshot:', error);
  }
}

async function setupPerformanceMonitoring() {
  try {
    // Enable performance monitoring
    await this.page.addInitScript(() => {
      window.performance.mark = window.performance.mark || function() {};
      window.performance.measure = window.performance.measure || function() {};
      
      // Custom performance observer
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            console.log(`Performance: ${entry.name} - ${entry.duration}ms`);
          }
        });
        observer.observe({ entryTypes: ['navigation', 'resource', 'paint'] });
      }
    });
  } catch (error) {
    globalLogger.error('Failed to setup performance monitoring:', error);
  }
}

async function setupAccessibilityTesting() {
  try {
    // Install axe-core for accessibility testing
    await this.page.addInitScript(() => {
      // This would typically load axe-core from CDN or local file
      console.log('Accessibility testing enabled');
    });
  } catch (error) {
    globalLogger.error('Failed to setup accessibility testing:', error);
  }
}

async function setupVisualTesting() {
  try {
    // Setup visual testing baseline directory
    const baselineDir = process.env.VISUAL_BASELINE_PATH || './baselines';
    if (!fs.existsSync(baselineDir)) {
      fs.mkdirSync(baselineDir, { recursive: true });
    }
  } catch (error) {
    globalLogger.error('Failed to setup visual testing:', error);
  }
}

async function generatePerformanceReport() {
  try {
    const reportPath = path.join(
      process.env.PERFORMANCE_RESULTS_PATH || './reports/performance',
      `performance_${this.scenarioName.replace(/\s+/g, '_')}.json`
    );
    
    const report = {
      scenario: this.scenarioName,
      timestamp: new Date().toISOString(),
      metrics: this.performanceMetrics
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    globalLogger.info(`Performance report generated: ${reportPath}`);
  } catch (error) {
    globalLogger.error('Failed to generate performance report:', error);
  }
}

async function generateAccessibilityReport() {
  try {
    // Run accessibility audit
    const results = await this.base.runAccessibilityAudit();
    
    const reportPath = path.join(
      process.env.REPORT_PATH || './reports',
      `accessibility_${this.scenarioName.replace(/\s+/g, '_')}.json`
    );
    
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    globalLogger.info(`Accessibility report generated: ${reportPath}`);
  } catch (error) {
    globalLogger.error('Failed to generate accessibility report:', error);
  }
}

async function cleanupTestData() {
  try {
    // Clear any test data created during the scenario
    if (this.apiClient) {
      // Clean up any test data created via API
    }
    
    // Clear browser storage
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  } catch (error) {
    globalLogger.error('Failed to cleanup test data:', error);
  }
}

async function generateComprehensiveReport() {
  try {
    const report = {
      summary: {
        totalScenarios: globalTestData.totalScenarios,
        passedScenarios: globalTestData.passedScenarios,
        failedScenarios: globalTestData.failedScenarios,
        successRate: ((globalTestData.passedScenarios / globalTestData.totalScenarios) * 100).toFixed(2),
        totalDuration: Date.now() - globalTestData.startTime.getTime(),
        startTime: globalTestData.startTime.toISOString(),
        endTime: new Date().toISOString()
      },
      performance: globalTestData.performanceMetrics,
      screenshots: globalTestData.screenshots,
      videos: globalTestData.videos,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        browser: process.env.BROWSER,
        baseUrl: process.env.BASE_URL,
        platform: process.platform,
        nodeVersion: process.version
      }
    };

    const reportPath = path.join(
      process.env.REPORT_PATH || './reports',
      'comprehensive-report.json'
    );
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    globalLogger.info(`Comprehensive report generated: ${reportPath}`);
  } catch (error) {
    globalLogger.error('Failed to generate comprehensive report:', error);
  }
}

async function generatePerformanceSummary() {
  try {
    if (globalTestData.performanceMetrics.length === 0) return;

    const summary = {
      totalTests: globalTestData.performanceMetrics.length,
      averageDuration: globalTestData.performanceMetrics.reduce((sum, test) => 
        sum + test.duration, 0) / globalTestData.performanceMetrics.length,
      slowestTest: Math.max(...globalTestData.performanceMetrics.map(test => test.duration)),
      fastestTest: Math.min(...globalTestData.performanceMetrics.map(test => test.duration))
    };

    const summaryPath = path.join(
      process.env.PERFORMANCE_RESULTS_PATH || './reports/performance',
      'performance-summary.json'
    );
    
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    globalLogger.info(`Performance summary generated: ${summaryPath}`);
  } catch (error) {
    globalLogger.error('Failed to generate performance summary:', error);
  }
}

async function sendTestNotifications() {
  try {
    const successRate = (globalTestData.passedScenarios / globalTestData.totalScenarios) * 100;
    
    // Send Slack notification if configured
    if (process.env.SLACK_WEBHOOK_URL) {
      const slackNotify = require('slack-notify');
      const slack = slackNotify(process.env.SLACK_WEBHOOK_URL);
      
      const message = {
        text: `Test Execution Complete`,
        attachments: [{
          color: successRate >= 90 ? 'good' : successRate >= 70 ? 'warning' : 'danger',
          fields: [
            { title: 'Total Scenarios', value: globalTestData.totalScenarios, short: true },
            { title: 'Passed', value: globalTestData.passedScenarios, short: true },
            { title: 'Failed', value: globalTestData.failedScenarios, short: true },
            { title: 'Success Rate', value: `${successRate.toFixed(2)}%`, short: true }
          ]
        }]
      };
      
      slack.send(message);
    }

    // Send email notification if configured
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER) {
      const nodemailer = require('nodemailer');
      
      const transporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_TO,
        subject: `Test Execution Report - ${successRate.toFixed(2)}% Success Rate`,
        html: `
          <h2>Test Execution Summary</h2>
          <p><strong>Total Scenarios:</strong> ${globalTestData.totalScenarios}</p>
          <p><strong>Passed:</strong> ${globalTestData.passedScenarios}</p>
          <p><strong>Failed:</strong> ${globalTestData.failedScenarios}</p>
          <p><strong>Success Rate:</strong> ${successRate.toFixed(2)}%</p>
        `
      };

      await transporter.sendMail(mailOptions);
    }
  } catch (error) {
    globalLogger.error('Failed to send notifications:', error);
  }
}

async function cleanupTemporaryFiles() {
  try {
    const tempDirs = [
      path.join(__dirname, '../temp'),
      path.join(__dirname, '../.tmp')
    ];

    tempDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    });

    globalLogger.info('Temporary files cleaned up');
  } catch (error) {
    globalLogger.error('Failed to cleanup temporary files:', error);
  }
} 