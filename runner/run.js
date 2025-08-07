const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

class TestRunner {
  constructor() {
    this.cucumberPath = path.join(__dirname, '../node_modules/.bin/cucumber-js');
    this.reportsDir = path.join(__dirname, '../reports');
  }

  async runTests(options = {}) {
    try {
      console.log('🚀 Starting test execution...');
      
      // Create reports directory if it doesn't exist
      if (!fs.existsSync(this.reportsDir)) {
        fs.mkdirSync(this.reportsDir, { recursive: true });
      }

      // Build cucumber command
      let command = this.cucumberPath;
      
      // Add format options
      command += ' --format progress-bar';
      command += ' --format html:reports/cucumber-report.html';
      command += ' --format json:reports/cucumber-report.json';
      
      // Add parallel execution if specified
      if (options.parallel) {
        command += ` --parallel ${options.parallel}`;
      }
      
      // Add tags if specified
      if (options.tags) {
        command += ` --tags "${options.tags}"`;
      }
      
      // Add world parameters for browser/environment
      if (options.browser || options.environment || options.headed) {
        const worldParams = {};
        if (options.browser) worldParams.browser = options.browser;
        if (options.environment) worldParams.environment = options.environment;
        if (options.headed) worldParams.headed = options.headed;
        
        command += ` --world-parameters '${JSON.stringify(worldParams)}'`;
      }
      
      // Add retry option
      if (options.retry) {
        command += ` --retry ${options.retry}`;
      }
      
      // Add specific feature files if specified
      if (options.features) {
        command += ` ${options.features}`;
      }
      
      console.log(`📋 Executing command: ${command}`);
      
      // Execute the command
      const result = execSync(command, { 
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit',
        encoding: 'utf8'
      });
      
      console.log('✅ Test execution completed successfully');
      return result;
      
    } catch (error) {
      console.error('❌ Test execution failed:', error.message);
      throw error;
    }
  }

  async runSmokeTests() {
    console.log('🔥 Running smoke tests...');
    return await this.runTests({ tags: '@smoke' });
  }

  async runRegressionTests() {
    console.log('🔄 Running regression tests...');
    return await this.runTests({ tags: '@regression' });
  }

  async runLoginTests() {
    console.log('🔐 Running login tests...');
    return await this.runTests({ tags: '@login' });
  }

  async runTestsInParallel(workers = 2) {
    console.log(`⚡ Running tests in parallel with ${workers} workers...`);
    return await this.runTests({ parallel: workers });
  }

  async runTestsInHeadedMode() {
    console.log('🖥️ Running tests in headed mode...');
    return await this.runTests({ headed: true });
  }

  async runTestsWithBrowser(browser) {
    console.log(`🌐 Running tests with ${browser} browser...`);
    return await this.runTests({ browser });
  }

  async runTestsInEnvironment(environment) {
    console.log(`🔧 Running tests in ${environment} environment...`);
    return await this.runTests({ environment });
  }

  async runSpecificFeature(featurePath) {
    console.log(`📄 Running specific feature: ${featurePath}`);
    return await this.runTests({ features: featurePath });
  }

  async runTestsWithRetry(retryCount = 2) {
    console.log(`🔄 Running tests with ${retryCount} retry attempts...`);
    return await this.runTests({ retry: retryCount });
  }

  async runAllTests() {
    console.log('🎯 Running all tests...');
    return await this.runTests();
  }
}

// CLI interface
if (require.main === module) {
  const runner = new TestRunner();
  const args = process.argv.slice(2);
  
  const options = {
    smoke: args.includes('--smoke'),
    regression: args.includes('--regression'),
    login: args.includes('--login'),
    parallel: args.find(arg => arg.startsWith('--parallel='))?.split('=')[1],
    headed: args.includes('--headed'),
    browser: args.find(arg => arg.startsWith('--browser='))?.split('=')[1],
    environment: args.find(arg => arg.startsWith('--env='))?.split('=')[1],
    retry: args.find(arg => arg.startsWith('--retry='))?.split('=')[1],
    feature: args.find(arg => arg.startsWith('--feature='))?.split('=')[1]
  };

  (async () => {
    try {
      if (options.smoke) {
        await runner.runSmokeTests();
      } else if (options.regression) {
        await runner.runRegressionTests();
      } else if (options.login) {
        await runner.runLoginTests();
      } else if (options.parallel) {
        await runner.runTestsInParallel(parseInt(options.parallel));
      } else if (options.headed) {
        await runner.runTestsInHeadedMode();
      } else if (options.browser) {
        await runner.runTestsWithBrowser(options.browser);
      } else if (options.environment) {
        await runner.runTestsInEnvironment(options.environment);
      } else if (options.feature) {
        await runner.runSpecificFeature(options.feature);
      } else if (options.retry) {
        await runner.runTestsWithRetry(parseInt(options.retry));
      } else {
        await runner.runAllTests();
      }
    } catch (error) {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    }
  })();
}

module.exports = TestRunner; 