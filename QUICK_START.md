# 🚀 Quick Start Guide - Advanced Automation Framework

Get up and running with the Advanced Playwright Cucumber Automation Framework in minutes!

## 📋 Prerequisites

- **Node.js** 16.0.0 or higher
- **npm** 8.0.0 or higher
- **Git** (optional but recommended)

## ⚡ Quick Setup (5 minutes)

### 1. Clone and Install
```bash
# Clone the repository
git clone <your-repo-url>
cd automation-framework

# Run automated setup
npm run setup
```

### 2. Configure Environment
Edit `env.config` file:
```bash
# Update these values for your application
BASE_URL=https://your-application-url.com
API_BASE_URL=https://your-api-url.com
TEST_USER_EMAIL=your-test-email@example.com
TEST_USER_PASSWORD=your-test-password
```

### 3. Run Your First Test
```bash
# Run smoke tests
npm run test:smoke

# Run API tests
npm run test:api

# Run in headed mode (see browser)
npm run test:headed
```

## 🎯 Common Use Cases

### UI Testing
```bash
# Run all UI tests
npm run test

# Run specific feature
npm run test:login

# Run in parallel
npm run test:parallel

# Run on specific browser
npm run test:chrome
npm run test:firefox
npm run test:webkit
```

### API Testing
```bash
# Run all API tests
npm run test:api

# Run performance tests
npm run test:performance

# Run with custom API endpoint
API_BASE_URL=https://your-api.com npm run test:api
```

### Mobile Testing
```bash
# Run mobile device tests
npm run test:mobile

# Run tablet device tests
npm run test:tablet
```

### Performance Testing
```bash
# Run performance tests
npm run test:performance

# Run accessibility tests
npm run test:accessibility

# Run visual regression tests
npm run test:visual
```

## 📊 Viewing Results

### HTML Reports
```bash
# Generate HTML report
npm run report:html

# Open report in browser
open reports/cucumber-html-report.html
```

### Allure Reports
```bash
# Generate and open Allure report
npm run report:allure
```

### Performance Reports
```bash
# View performance results
open reports/performance/performance-summary.json
```

## 🔧 Development Workflow

### 1. Write a New Test
Create a new feature file in `features/`:
```gherkin
@new-feature
Feature: New Feature
  As a user
  I want to test a new feature
  So that I can ensure it works

  Scenario: Test new functionality
    Given I am on the application page
    When I perform an action
    Then I should see the expected result
```

### 2. Add Step Definitions
Create step definitions in `step-definitions/`:
```javascript
const { Given, When, Then } = require('@cucumber/cucumber');

Given('I am on the application page', async function () {
  await this.page.goto('https://your-app.com');
});

When('I perform an action', async function () {
  await this.page.click('#button');
});

Then('I should see the expected result', async function () {
  const text = await this.page.textContent('#result');
  expect(text).to.include('Expected');
});
```

### 3. Run and Debug
```bash
# Run specific feature
npm run test -- --grep "New Feature"

# Run in debug mode
npm run test:debug

# Run in headed mode
npm run test:headed
```

## 🐳 Docker Quick Start

### Using Docker Compose
```bash
# Build and run all services
docker-compose up --build

# Run only the automation framework
docker-compose up automation-framework

# Run specific test suite
docker-compose run automation-framework npm run test:smoke
```

### Using Docker Directly
```bash
# Build image
docker build -t automation-framework .

# Run tests
docker run -it automation-framework npm test

# Run with volume mount for reports
docker run -it -v $(pwd)/reports:/app/reports automation-framework npm test
```

## 🔄 CI/CD Integration

### GitHub Actions
The framework includes a complete GitHub Actions workflow. Just push to your repository:

```bash
git add .
git commit -m "Add new tests"
git push origin main
```

The workflow will automatically:
- Run tests on multiple browsers
- Execute API and performance tests
- Generate reports
- Send notifications

### Local CI Simulation
```bash
# Run the same commands as CI
npm run lint
npm run security:audit
npm run test:smoke
npm run test:api
npm run report
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Browser Not Found
```bash
# Reinstall Playwright browsers
npm run install:playwright
```

#### 2. Tests Timing Out
```bash
# Increase timeout in env.config
TIMEOUT=60000

# Run with longer timeout
TIMEOUT=60000 npm test
```

#### 3. API Tests Failing
```bash
# Check API endpoint
curl https://your-api-url.com/health

# Run with debug logging
DEBUG=* npm run test:api
```

#### 4. Performance Tests Slow
```bash
# Reduce concurrent requests
PARALLEL_WORKERS=2 npm run test:performance

# Run single performance test
npm run test -- --grep "performance" --parallel 1
```

### Debug Mode
```bash
# Run in debug mode
npm run test:debug

# Run with verbose logging
DEBUG=* npm test

# Run in headed mode
npm run test:headed
```

## 📈 Advanced Features

### Parallel Execution
```bash
# Run with 4 parallel workers
npm run test:parallel

# Run with custom parallel count
PARALLEL_WORKERS=8 npm test
```

### Retry Failed Tests
```bash
# Re-run failed tests
npm run rerun

# Re-run with retry
node runner/reRunner.js --retry=3
```

### Custom Reports
```bash
# Generate detailed report
node runner/generateReport.js --detailed

# Generate feature-specific report
node runner/generateReport.js --feature=login

# Clean old reports
node runner/generateReport.js --cleanup=7
```

### Environment Switching
```bash
# Run against different environments
NODE_ENV=dev npm test
NODE_ENV=stage npm test
NODE_ENV=prod npm test
```

## 🎯 Best Practices

### 1. Test Organization
- Group related scenarios in feature files
- Use meaningful tags for filtering
- Keep step definitions focused and reusable

### 2. Data Management
- Use environment variables for test data
- Avoid hardcoded values in tests
- Use data factories for test data generation

### 3. Performance
- Use parallel execution for faster feedback
- Clean up test data after tests
- Monitor test execution performance

### 4. Maintenance
- Keep selectors centralized
- Update page objects when UI changes
- Regular dependency updates

## 📞 Getting Help

### Documentation
- **README.md** - Complete framework documentation
- **IDE_SETUP.md** - IDE configuration guide
- **API Documentation** - API testing examples

### Support
- Create an issue in the repository
- Check the troubleshooting section
- Review the logs in `logs/` directory

### Community
- Join the automation community
- Share your test scenarios
- Contribute to the framework

---

**Happy Testing! 🎉**

*This framework is designed to make automation testing easy, powerful, and maintainable.* 