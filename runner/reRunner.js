const fs = require('fs');
const path = require('path');
const TestRunner = require('./run');

class ReRunner {
  constructor() {
    this.reportsDir = path.join(__dirname, '../reports');
    this.failedScenariosFile = path.join(this.reportsDir, 'failed-scenarios.json');
    this.cucumberReportFile = path.join(this.reportsDir, 'cucumber-report.json');
  }

  async getFailedScenarios() {
    try {
      if (!fs.existsSync(this.cucumberReportFile)) {
        console.log('❌ No cucumber report found. Run tests first.');
        return [];
      }

      const reportData = JSON.parse(fs.readFileSync(this.cucumberReportFile, 'utf8'));
      const failedScenarios = [];

      reportData.forEach(feature => {
        feature.elements.forEach(scenario => {
          if (scenario.steps.some(step => step.result.status === 'failed')) {
            failedScenarios.push({
              feature: feature.name,
              scenario: scenario.name,
              tags: scenario.tags.map(tag => tag.name).join(' '),
              line: scenario.line
            });
          }
        });
      });

      return failedScenarios;
    } catch (error) {
      console.error('❌ Error reading failed scenarios:', error);
      return [];
    }
  }

  async saveFailedScenarios(failedScenarios) {
    try {
      fs.writeFileSync(this.failedScenariosFile, JSON.stringify(failedScenarios, null, 2));
      console.log(`💾 Saved ${failedScenarios.length} failed scenarios to ${this.failedScenariosFile}`);
    } catch (error) {
      console.error('❌ Error saving failed scenarios:', error);
    }
  }

  async rerunFailedScenarios(options = {}) {
    try {
      console.log('🔄 Starting re-run of failed scenarios...');

      // Get failed scenarios from the last run
      const failedScenarios = await this.getFailedScenarios();

      if (failedScenarios.length === 0) {
        console.log('✅ No failed scenarios to re-run');
        return;
      }

      console.log(`📋 Found ${failedScenarios.length} failed scenarios to re-run:`);
      failedScenarios.forEach((scenario, index) => {
        console.log(`   ${index + 1}. ${scenario.feature} - ${scenario.scenario}`);
      });

      // Save failed scenarios for reference
      await this.saveFailedScenarios(failedScenarios);

      // Build tags for failed scenarios
      const failedTags = failedScenarios.map(scenario => scenario.tags).filter(tags => tags);
      const uniqueTags = [...new Set(failedTags.flat())];

      // Create a tag filter for failed scenarios
      const tagFilter = uniqueTags.length > 0 ? uniqueTags.join(' or ') : '';

      // Run tests with failed scenario tags
      const runner = new TestRunner();
      const rerunOptions = {
        ...options,
        tags: tagFilter
      };

      console.log(`🏷️  Re-running with tags: ${tagFilter}`);
      await runner.runTests(rerunOptions);

      // Check if re-run was successful
      const newFailedScenarios = await this.getFailedScenarios();
      
      if (newFailedScenarios.length === 0) {
        console.log('✅ All previously failed scenarios passed on re-run!');
      } else {
        console.log(`⚠️  ${newFailedScenarios.length} scenarios still failed after re-run`);
        newFailedScenarios.forEach((scenario, index) => {
          console.log(`   ${index + 1}. ${scenario.feature} - ${scenario.scenario}`);
        });
      }

    } catch (error) {
      console.error('❌ Error during re-run:', error);
      throw error;
    }
  }

  async rerunWithRetry(maxRetries = 3) {
    try {
      console.log(`🔄 Starting re-run with max ${maxRetries} retries...`);

      let attempt = 1;
      let failedScenarios = await this.getFailedScenarios();

      while (failedScenarios.length > 0 && attempt <= maxRetries) {
        console.log(`\n🔄 Attempt ${attempt}/${maxRetries}`);
        console.log(`📋 Re-running ${failedScenarios.length} failed scenarios...`);

        await this.rerunFailedScenarios({ retry: 1 });

        failedScenarios = await this.getFailedScenarios();
        attempt++;
      }

      if (failedScenarios.length === 0) {
        console.log('✅ All scenarios passed after re-runs!');
      } else {
        console.log(`❌ ${failedScenarios.length} scenarios still failed after ${maxRetries} attempts`);
        console.log('📋 Final failed scenarios:');
        failedScenarios.forEach((scenario, index) => {
          console.log(`   ${index + 1}. ${scenario.feature} - ${scenario.scenario}`);
        });
      }

    } catch (error) {
      console.error('❌ Error during retry re-run:', error);
      throw error;
    }
  }

  async rerunSpecificScenarios(scenarioNames, options = {}) {
    try {
      console.log(`🔄 Re-running specific scenarios: ${scenarioNames.join(', ')}`);

      const runner = new TestRunner();
      const rerunOptions = {
        ...options,
        features: scenarioNames.map(name => `features/${name}.feature`).join(' ')
      };

      await runner.runTests(rerunOptions);

    } catch (error) {
      console.error('❌ Error re-running specific scenarios:', error);
      throw error;
    }
  }

  async rerunWithDifferentBrowser(browser) {
    try {
      console.log(`🔄 Re-running failed scenarios with ${browser} browser...`);

      await this.rerunFailedScenarios({ browser });

    } catch (error) {
      console.error('❌ Error re-running with different browser:', error);
      throw error;
    }
  }

  async rerunInHeadedMode() {
    try {
      console.log('🔄 Re-running failed scenarios in headed mode...');

      await this.rerunFailedScenarios({ headed: true });

    } catch (error) {
      console.error('❌ Error re-running in headed mode:', error);
      throw error;
    }
  }

  async getFailedScenariosReport() {
    try {
      const failedScenarios = await this.getFailedScenarios();
      
      if (failedScenarios.length === 0) {
        console.log('✅ No failed scenarios found');
        return;
      }

      console.log('\n📊 Failed Scenarios Report:');
      console.log('========================');
      
      failedScenarios.forEach((scenario, index) => {
        console.log(`\n${index + 1}. Feature: ${scenario.feature}`);
        console.log(`   Scenario: ${scenario.scenario}`);
        console.log(`   Tags: ${scenario.tags}`);
        console.log(`   Line: ${scenario.line}`);
      });

      console.log(`\n📈 Summary: ${failedScenarios.length} failed scenarios`);

    } catch (error) {
      console.error('❌ Error generating failed scenarios report:', error);
    }
  }

  async cleanupReports() {
    try {
      const filesToClean = [
        this.cucumberReportFile,
        this.failedScenariosFile
      ];

      filesToClean.forEach(file => {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
          console.log(`🗑️  Cleaned up: ${path.basename(file)}`);
        }
      });

      console.log('✅ Reports cleanup completed');

    } catch (error) {
      console.error('❌ Error during cleanup:', error);
    }
  }
}

// CLI interface
if (require.main === module) {
  const reRunner = new ReRunner();
  const args = process.argv.slice(2);

  const options = {
    retry: args.find(arg => arg.startsWith('--retry='))?.split('=')[1],
    browser: args.find(arg => arg.startsWith('--browser='))?.split('=')[1],
    headed: args.includes('--headed'),
    report: args.includes('--report'),
    cleanup: args.includes('--cleanup'),
    scenarios: args.find(arg => arg.startsWith('--scenarios='))?.split('=')[1]?.split(',')
  };

  (async () => {
    try {
      if (options.report) {
        await reRunner.getFailedScenariosReport();
      } else if (options.cleanup) {
        await reRunner.cleanupReports();
      } else if (options.scenarios) {
        await reRunner.rerunSpecificScenarios(options.scenarios);
      } else if (options.browser) {
        await reRunner.rerunWithDifferentBrowser(options.browser);
      } else if (options.headed) {
        await reRunner.rerunInHeadedMode();
      } else if (options.retry) {
        await reRunner.rerunWithRetry(parseInt(options.retry));
      } else {
        await reRunner.rerunFailedScenarios();
      }
    } catch (error) {
      console.error('❌ Re-run failed:', error);
      process.exit(1);
    }
  })();
}

module.exports = ReRunner; 