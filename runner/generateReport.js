const fs = require('fs');
const path = require('path');
const moment = require('moment');
const reporter = require('cucumber-html-reporter');

class ReportGenerator {
  constructor() {
    this.reportsDir = path.join(__dirname, '../reports');
    this.cucumberReportFile = path.join(this.reportsDir, 'cucumber-report.json');
    this.htmlReportFile = path.join(this.reportsDir, 'cucumber-html-report.html');
  }

  async generateHTMLReport() {
    try {
      if (!fs.existsSync(this.cucumberReportFile)) {
        console.log('❌ No cucumber JSON report found. Run tests first.');
        return;
      }

      console.log('📊 Generating HTML report...');

      const options = {
        theme: 'bootstrap',
        jsonFile: this.cucumberReportFile,
        output: this.htmlReportFile,
        reportSuiteAsScenarios: true,
        scenarioTimestamp: true,
        launchReport: false,
        metadata: {
          "App Version": "1.0.0",
          "Test Environment": process.env.NODE_ENV || "development",
          "Browser": process.env.BROWSER || "chromium",
          "Platform": process.platform,
          "Parallel": "Scenarios",
          "Executed": moment().format('YYYY-MM-DD HH:mm:ss')
        },
        customData: {
          title: 'Test Execution Report',
          data: [
            { label: 'Project', value: 'Demo Web Shop Automation' },
            { label: 'Release', value: '1.0.0' },
            { label: 'Execution Start Time', value: moment().format('YYYY-MM-DD HH:mm:ss') },
            { label: 'Execution End Time', value: moment().format('YYYY-MM-DD HH:mm:ss') }
          ]
        }
      };

      reporter.generate(options);

      console.log(`✅ HTML report generated: ${this.htmlReportFile}`);

    } catch (error) {
      console.error('❌ Error generating HTML report:', error);
      throw error;
    }
  }

  async generateDetailedReport() {
    try {
      if (!fs.existsSync(this.cucumberReportFile)) {
        console.log('❌ No cucumber JSON report found. Run tests first.');
        return;
      }

      console.log('📊 Generating detailed report...');

      const reportData = JSON.parse(fs.readFileSync(this.cucumberReportFile, 'utf8'));
      const detailedReport = this.analyzeReportData(reportData);

      const detailedReportFile = path.join(this.reportsDir, 'detailed-report.json');
      fs.writeFileSync(detailedReportFile, JSON.stringify(detailedReport, null, 2));

      console.log(`✅ Detailed report generated: ${detailedReportFile}`);
      this.printReportSummary(detailedReport);

    } catch (error) {
      console.error('❌ Error generating detailed report:', error);
      throw error;
    }
  }

  analyzeReportData(reportData) {
    const analysis = {
      summary: {
        totalFeatures: 0,
        totalScenarios: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0
      },
      features: [],
      scenarios: [],
      failures: [],
      performance: {
        slowestScenarios: [],
        fastestScenarios: []
      }
    };

    reportData.forEach(feature => {
      analysis.summary.totalFeatures++;
      
      const featureAnalysis = {
        name: feature.name,
        scenarios: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0
      };

      feature.elements.forEach(scenario => {
        analysis.summary.totalScenarios++;
        featureAnalysis.scenarios++;

        const scenarioAnalysis = {
          feature: feature.name,
          name: scenario.name,
          status: 'unknown',
          duration: 0,
          steps: {
            total: scenario.steps.length,
            passed: 0,
            failed: 0,
            skipped: 0
          },
          tags: scenario.tags.map(tag => tag.name),
          line: scenario.line
        };

        let scenarioDuration = 0;
        let hasFailure = false;

        scenario.steps.forEach(step => {
          if (step.result) {
            scenarioAnalysis.steps[step.result.status]++;
            scenarioDuration += step.result.duration || 0;

            if (step.result.status === 'failed') {
              hasFailure = true;
              analysis.failures.push({
                feature: feature.name,
                scenario: scenario.name,
                step: step.name,
                error: step.result.error_message,
                line: scenario.line
              });
            }
          }
        });

        scenarioAnalysis.duration = scenarioDuration;
        scenarioAnalysis.status = hasFailure ? 'failed' : 'passed';

        if (hasFailure) {
          analysis.summary.failed++;
          featureAnalysis.failed++;
        } else {
          analysis.summary.passed++;
          featureAnalysis.passed++;
        }

        analysis.summary.duration += scenarioDuration;
        featureAnalysis.duration += scenarioDuration;

        analysis.scenarios.push(scenarioAnalysis);
      });

      analysis.features.push(featureAnalysis);
    });

    // Sort scenarios by duration for performance analysis
    analysis.scenarios.sort((a, b) => b.duration - a.duration);
    analysis.performance.slowestScenarios = analysis.scenarios.slice(0, 5);
    analysis.performance.fastestScenarios = analysis.scenarios.slice(-5).reverse();

    return analysis;
  }

  printReportSummary(analysis) {
    console.log('\n📈 Test Execution Summary');
    console.log('========================');
    console.log(`Total Features: ${analysis.summary.totalFeatures}`);
    console.log(`Total Scenarios: ${analysis.summary.totalScenarios}`);
    console.log(`Passed: ${analysis.summary.passed} (${((analysis.summary.passed / analysis.summary.totalScenarios) * 100).toFixed(1)}%)`);
    console.log(`Failed: ${analysis.summary.failed} (${((analysis.summary.failed / analysis.summary.totalScenarios) * 100).toFixed(1)}%)`);
    console.log(`Skipped: ${analysis.summary.skipped} (${((analysis.summary.skipped / analysis.summary.totalScenarios) * 100).toFixed(1)}%)`);
    console.log(`Total Duration: ${(analysis.summary.duration / 1000000000).toFixed(2)}s`);

    if (analysis.failures.length > 0) {
      console.log('\n❌ Failures Summary');
      console.log('==================');
      analysis.failures.forEach((failure, index) => {
        console.log(`${index + 1}. ${failure.feature} - ${failure.scenario}`);
        console.log(`   Step: ${failure.step}`);
        console.log(`   Error: ${failure.error.substring(0, 100)}...`);
      });
    }

    if (analysis.performance.slowestScenarios.length > 0) {
      console.log('\n🐌 Slowest Scenarios');
      console.log('===================');
      analysis.performance.slowestScenarios.forEach((scenario, index) => {
        console.log(`${index + 1}. ${scenario.feature} - ${scenario.name}`);
        console.log(`   Duration: ${(scenario.duration / 1000000000).toFixed(2)}s`);
      });
    }
  }

  async generateFeatureReport(featureName) {
    try {
      if (!fs.existsSync(this.cucumberReportFile)) {
        console.log('❌ No cucumber JSON report found. Run tests first.');
        return;
      }

      const reportData = JSON.parse(fs.readFileSync(this.cucumberReportFile, 'utf8'));
      const feature = reportData.find(f => f.name.toLowerCase().includes(featureName.toLowerCase()));

      if (!feature) {
        console.log(`❌ Feature "${featureName}" not found in report`);
        return;
      }

      console.log(`📊 Generating report for feature: ${feature.name}`);

      const featureReport = {
        name: feature.name,
        description: feature.description,
        scenarios: feature.elements.map(scenario => ({
          name: scenario.name,
          status: scenario.steps.some(step => step.result && step.result.status === 'failed') ? 'failed' : 'passed',
          steps: scenario.steps.map(step => ({
            name: step.name,
            status: step.result ? step.result.status : 'unknown',
            duration: step.result ? step.result.duration : 0
          }))
        }))
      };

      const featureReportFile = path.join(this.reportsDir, `${featureName.toLowerCase().replace(/\s+/g, '-')}-report.json`);
      fs.writeFileSync(featureReportFile, JSON.stringify(featureReport, null, 2));

      console.log(`✅ Feature report generated: ${featureReportFile}`);

    } catch (error) {
      console.error('❌ Error generating feature report:', error);
      throw error;
    }
  }

  async cleanupOldReports(daysToKeep = 7) {
    try {
      console.log(`🗑️  Cleaning up reports older than ${daysToKeep} days...`);

      const files = fs.readdirSync(this.reportsDir);
      const cutoffDate = moment().subtract(daysToKeep, 'days');

      let cleanedCount = 0;

      files.forEach(file => {
        const filePath = path.join(this.reportsDir, file);
        const stats = fs.statSync(filePath);

        if (moment(stats.mtime).isBefore(cutoffDate)) {
          fs.unlinkSync(filePath);
          console.log(`🗑️  Deleted: ${file}`);
          cleanedCount++;
        }
      });

      console.log(`✅ Cleaned up ${cleanedCount} old report files`);

    } catch (error) {
      console.error('❌ Error during cleanup:', error);
    }
  }
}

// CLI interface
if (require.main === module) {
  const reportGenerator = new ReportGenerator();
  const args = process.argv.slice(2);

  const options = {
    html: args.includes('--html'),
    detailed: args.includes('--detailed'),
    feature: args.find(arg => arg.startsWith('--feature='))?.split('=')[1],
    cleanup: args.find(arg => arg.startsWith('--cleanup='))?.split('=')[1]
  };

  (async () => {
    try {
      if (options.html) {
        await reportGenerator.generateHTMLReport();
      } else if (options.detailed) {
        await reportGenerator.generateDetailedReport();
      } else if (options.feature) {
        await reportGenerator.generateFeatureReport(options.feature);
      } else if (options.cleanup) {
        await reportGenerator.cleanupOldReports(parseInt(options.cleanup));
      } else {
        // Generate all reports by default
        await reportGenerator.generateHTMLReport();
        await reportGenerator.generateDetailedReport();
      }
    } catch (error) {
      console.error('❌ Report generation failed:', error);
      process.exit(1);
    }
  })();
}

module.exports = ReportGenerator; 