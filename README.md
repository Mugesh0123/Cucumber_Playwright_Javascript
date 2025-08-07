# 🚀 Advanced Playwright Cucumber Automation Framework v2.0

A comprehensive, enterprise-grade automation testing framework using JavaScript (ES6+), Cucumber BDD, Playwright, and advanced testing capabilities including API testing, performance monitoring, accessibility testing, and visual regression testing.

## 🌟 Key Features

### 🎯 Core Testing Capabilities
- **BDD Testing**: Cucumber with .feature files and step definitions
- **Browser Automation**: Playwright with Chromium, Firefox, and WebKit support
- **API Testing**: Comprehensive REST API testing with authentication, validation, and performance monitoring
- **Mobile Testing**: Device emulation for mobile and tablet testing
- **Cross-browser Testing**: Support for multiple browsers and versions

### 📊 Advanced Reporting & Analytics
- **Multiple Report Formats**: HTML, JSON, JUnit, Allure reports
- **Performance Metrics**: Response time analysis, load testing results
- **Accessibility Reports**: WCAG compliance testing and reporting
- **Visual Regression**: Screenshot comparison and baseline management
- **Real-time Monitoring**: Live test execution monitoring

### 🔧 Development & Quality
- **Code Quality**: ESLint, Prettier, and Husky for code consistency
- **Type Safety**: Joi schema validation for API responses
- **Error Handling**: Comprehensive error handling and retry mechanisms
- **Logging**: Structured logging with Winston
- **Security**: Security audits and dependency scanning

### 🚀 DevOps & CI/CD
- **Docker Support**: Containerized test execution
- **GitHub Actions**: Complete CI/CD pipeline
- **Parallel Execution**: Multi-threaded test execution
- **Environment Management**: Multi-environment support
- **Notifications**: Slack, Teams, and email notifications

## 📁 Enhanced Project Structure

```
├── features/
│   ├── login.feature                 # UI testing features
│   ├── api.feature                   # API testing features
│   ├── performance.feature           # Performance testing
│   └── accessibility.feature         # Accessibility testing
├── step-definitions/
│   ├── loginSteps.js                 # UI step definitions
│   ├── apiSteps.js                   # API step definitions
│   └── commonSteps.js                # Shared step definitions
├── pages/
│   ├── LoginPage.js                  # Page object classes
│   └── BasePage.js                   # Base page class
├── support/
│   ├── base.js                       # Enhanced base class
│   ├── apiClient.js                  # API testing client
│   ├── hooks.js                      # Advanced lifecycle hooks
│   └── webElements.js                # Web element utilities
├── selectors/
│   └── loginSelectors.js             # Centralized selectors
├── runner/
│   ├── run.js                        # Test execution runner
│   ├── reRunner.js                   # Re-run failed tests
│   └── generateReport.js             # Report generation
├── config/
│   ├── cucumber.js                   # Cucumber configuration
│   ├── playwright.config.js          # Playwright settings
│   └── env.config                    # Environment variables
├── reports/                          # Generated reports
├── logs/                             # Application logs
├── baselines/                        # Visual testing baselines
├── .github/
│   └── workflows/
│       └── test.yml                  # GitHub Actions workflow
├── Dockerfile                        # Docker configuration
├── docker-compose.yml                # Docker Compose setup
├── .eslintrc.js                      # ESLint configuration
├── .prettierrc                       # Prettier configuration
└── package.json                      # Dependencies and scripts
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 16+ 
- npm 8+
- Git

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd automation-framework

# Install dependencies
npm run install:all

# Run setup validation
npm run validate

# Run smoke tests
npm run test:smoke
```

### Docker Setup
```bash
# Build and run with Docker
docker-compose up --build

# Run specific test suite
docker run -it automation-framework npm run test:api
```

## 🏃‍♂️ Running Tests

### Basic Commands
```bash
# Run all tests
npm test

# Run tests in parallel
npm run test:parallel

# Run specific test types
npm run test:smoke          # Smoke tests
npm run test:regression     # Regression tests
npm run test:api           # API tests
npm run test:performance   # Performance tests
npm run test:accessibility # Accessibility tests
npm run test:visual        # Visual regression tests
```

### Advanced Commands
```bash
# Run with custom options
node runner/run.js --smoke --headed --browser=firefox --parallel=4

# Run specific feature
node runner/run.js --feature=login

# Run with retry
node runner/run.js --retry=3

# Re-run failed tests
npm run rerun

# Generate specific reports
npm run report:allure      # Allure reports
npm run report:html        # HTML reports
npm run report:junit       # JUnit reports
```

### Environment-Specific Testing
```bash
# Run against different environments
npm run test:dev          # Development environment
npm run test:stage        # Staging environment
npm run test:prod         # Production environment

# Run on different devices
npm run test:mobile       # Mobile device emulation
npm run test:tablet       # Tablet device emulation
```

## 📝 Writing Tests

### UI Testing with BDD
```gherkin
@login @smoke
Feature: Login Functionality
  As a user
  I want to be able to login to the application
  So that I can access my account

  Background:
    Given I am on the login page

  @valid-login
  Scenario: Successful login with valid credentials
    When I enter valid email "test@example.com"
    And I enter valid password "test123"
    And I click the login button
    Then I should be successfully logged in
    And I should see the welcome message
```

### API Testing
```gherkin
@api @smoke
Feature: API Testing
  As a QA Engineer
  I want to test the application's API endpoints
  So that I can ensure the backend functionality works correctly

  Background:
    Given I have a valid API client configured

  @authentication
  Scenario: Successful API authentication
    When I authenticate with valid credentials
    Then I should receive a valid access token
    And the response status should be 200
```

### Performance Testing
```gherkin
@performance @load
Feature: Performance Testing
  As a performance engineer
  I want to measure application performance
  So that I can ensure optimal user experience

  Scenario: API performance under load
    When I make 100 concurrent requests to the products endpoint
    Then all requests should complete within 5 seconds
    And the average response time should be less than 500ms
```

## 🔧 Configuration

### Environment Variables (env.config)
```bash
# Application URLs
BASE_URL=https://demowebshop.tricentis.com
API_BASE_URL=https://api.demowebshop.tricentis.com

# Browser Configuration
BROWSER=chromium
HEADLESS=false
VIEWPORT_WIDTH=1280
VIEWPORT_HEIGHT=720

# API Configuration
API_TIMEOUT=30000
API_RETRY_ATTEMPTS=3
API_RATE_LIMIT=100

# Performance Configuration
PERFORMANCE_THRESHOLD=3000
LIGHTHOUSE_THRESHOLD=90
ACCESSIBILITY_THRESHOLD=95

# Test Configuration
TIMEOUT=30000
RETRY_ATTEMPTS=2
PARALLEL_WORKERS=4
SLOW_TEST_THRESHOLD=5000

# Reporting
REPORT_PATH=./reports
SCREENSHOT_PATH=./reports/screenshots
VIDEO_PATH=./reports/videos
ALLURE_RESULTS_PATH=./reports/allure-results

# Notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
```

### Cucumber Configuration (cucumber.js)
```javascript
module.exports = {
  default: {
    requireModule: ['@babel/register'],
    require: [
      'step-definitions/**/*.js',
      'support/**/*.js'
    ],
    format: [
      'progress-bar',
      'html:reports/cucumber-report.html',
      'json:reports/cucumber-report.json',
      'allure-cucumberjs:reports/allure-results'
    ],
    parallel: 4,
    retry: 2,
    publishQuiet: true
  }
};
```

## 📊 Advanced Reporting

### Allure Reports
```bash
# Generate and open Allure report
npm run report:allure
```

### Performance Reports
```bash
# Generate performance summary
npm run report:performance
```

### Custom Reports
```bash
# Generate detailed JSON report
node runner/generateReport.js --detailed

# Generate feature-specific report
node runner/generateReport.js --feature=login

# Clean up old reports
node runner/generateReport.js --cleanup=7
```

## 🏷️ Advanced Tagging

```gherkin
@smoke        # Smoke tests
@regression   # Regression tests
@api          # API tests
@performance  # Performance tests
@accessibility # Accessibility tests
@visual       # Visual regression tests
@headed       # Run in headed mode
@mobile       # Mobile device testing
@tablet       # Tablet device testing
@slow         # Slow tests with extended timeout
@debug        # Debug mode
@parallel     # Parallel execution
@retry        # Retry on failure
```

## 🔄 Advanced Re-running

```bash
# Re-run all failed scenarios
npm run rerun

# Re-run with retry
node runner/reRunner.js --retry=3

# Re-run with different browser
node runner/reRunner.js --browser=firefox

# Re-run in headed mode
node runner/reRunner.js --headed

# Show failed scenarios report
node runner/reRunner.js --report

# Re-run specific scenarios
node runner/reRunner.js --scenarios=login,search
```

## 🧪 Advanced Testing Features

### API Testing Capabilities
- **Authentication**: Bearer tokens, API keys, Basic auth
- **Request/Response Validation**: Joi schema validation
- **Rate Limiting**: Automatic rate limit handling
- **Retry Logic**: Exponential backoff retry
- **File Upload/Download**: Multipart form data handling
- **WebSocket Support**: Real-time communication testing
- **Performance Monitoring**: Response time tracking

### Performance Testing
- **Load Testing**: Concurrent request testing
- **Response Time Analysis**: Detailed timing metrics
- **Lighthouse Audits**: Web performance scoring
- **Resource Monitoring**: Memory and CPU usage
- **Baseline Comparison**: Performance regression detection

### Accessibility Testing
- **WCAG Compliance**: WCAG 2.1 AA standards
- **Screen Reader Testing**: Accessibility audit
- **Keyboard Navigation**: Keyboard-only testing
- **Color Contrast**: Visual accessibility checks
- **ARIA Labels**: Semantic markup validation

### Visual Regression Testing
- **Baseline Management**: Screenshot baseline creation
- **Pixel Comparison**: Automated visual comparison
- **Tolerance Settings**: Configurable difference thresholds
- **Cross-browser Visual Testing**: Visual consistency across browsers
- **Responsive Design Testing**: Visual testing across viewports

## 🚀 CI/CD Integration

### GitHub Actions
The framework includes a comprehensive GitHub Actions workflow that:
- Runs tests on multiple Node.js versions and browsers
- Executes API, performance, and accessibility tests
- Generates and uploads test reports
- Sends notifications on test results
- Performs security audits

### Docker Integration
```bash
# Build and run tests in Docker
docker build -t automation-framework .
docker run -it automation-framework npm test

# Run with docker-compose
docker-compose up --build
```

## 🔒 Security Features

### Security Scanning
```bash
# Run security audit
npm run security:audit

# Fix security vulnerabilities
npm run security:fix

# Dependency scanning
npm audit --audit-level=moderate
```

### Code Quality
```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run prettier

# Check code formatting
npm run prettier:check
```

## 📈 Monitoring & Notifications

### Real-time Monitoring
- **Live Test Execution**: Real-time test progress tracking
- **Performance Metrics**: Live performance monitoring
- **Resource Usage**: System resource monitoring
- **Error Tracking**: Comprehensive error logging

### Notification Systems
- **Slack Integration**: Real-time Slack notifications
- **Teams Integration**: Microsoft Teams notifications
- **Email Notifications**: SMTP email alerts
- **Webhook Support**: Custom webhook notifications

## 🐛 Troubleshooting

### Common Issues
1. **Browser not found**
   ```bash
   npm run install:playwright
   ```

2. **Tests timing out**
   - Increase timeout in `env.config`
   - Check network connectivity
   - Verify application URL

3. **API tests failing**
   - Verify API endpoint URLs
   - Check authentication credentials
   - Validate request/response schemas

4. **Performance tests slow**
   - Reduce concurrent request count
   - Check system resources
   - Optimize test data

### Debug Mode
```bash
# Run in debug mode
npm run test:debug

# Run in headed mode
npm run test:headed

# Run with verbose logging
DEBUG=* npm test
```

## 📚 Best Practices

### Test Organization
1. **Feature Organization**: Group related scenarios
2. **Tag Management**: Use meaningful tags for filtering
3. **Data Management**: Use environment variables for test data
4. **Page Objects**: Keep page objects clean and focused
5. **Selectors**: Use centralized selectors for maintainability

### Code Quality
1. **ESLint Compliance**: Follow linting rules
2. **Prettier Formatting**: Maintain consistent code style
3. **Error Handling**: Implement proper error handling
4. **Logging**: Use structured logging
5. **Documentation**: Document complex test scenarios

### Performance
1. **Parallel Execution**: Use parallel execution for faster feedback
2. **Resource Management**: Clean up resources after tests
3. **Optimization**: Optimize test data and setup
4. **Monitoring**: Monitor test execution performance
5. **Baseline Management**: Maintain performance baselines

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Follow code quality standards
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the documentation
- Contact the automation team

---

**Happy Testing! 🎉**

*Built with ❤️ using Playwright, Cucumber, and modern JavaScript* 