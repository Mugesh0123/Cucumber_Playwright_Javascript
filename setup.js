#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

class FrameworkSetup {
  constructor() {
    this.projectRoot = __dirname;
    this.requiredDirs = [
      'reports',
      'reports/screenshots',
      'reports/videos',
      'reports/traces',
      'reports/allure-results',
      'reports/performance',
      'logs',
      'baselines',
      'temp'
    ];
    
    this.requiredFiles = [
      'package.json',
      'cucumber.js',
      'playwright.config.js',
      'env.config',
      '.eslintrc.js',
      '.prettierrc'
    ];
  }

  async run() {
    console.log(chalk.blue.bold('🚀 Advanced Playwright Cucumber Automation Framework Setup'));
    console.log(chalk.gray('Version 2.0.0\n'));

    try {
      await this.validateEnvironment();
      await this.createDirectories();
      await this.validateFiles();
      await this.installDependencies();
      await this.setupGitHooks();
      await this.validateConfiguration();
      await this.runHealthCheck();
      
      console.log(chalk.green.bold('\n✅ Framework setup completed successfully!'));
      this.displayNextSteps();
      
    } catch (error) {
      console.error(chalk.red.bold('\n❌ Setup failed:'), error.message);
      process.exit(1);
    }
  }

  async validateEnvironment() {
    console.log(chalk.yellow('🔍 Validating environment...'));
    
    // Check Node.js version
    const nodeVersion = process.version;
    const requiredVersion = '16.0.0';
    
    if (this.compareVersions(nodeVersion, requiredVersion) < 0) {
      throw new Error(`Node.js ${requiredVersion} or higher is required. Current version: ${nodeVersion}`);
    }
    
    console.log(chalk.green(`✅ Node.js version: ${nodeVersion}`));
    
    // Check npm version
    try {
      const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
      console.log(chalk.green(`✅ npm version: ${npmVersion}`));
    } catch (error) {
      console.warn(chalk.yellow('⚠️  Could not determine npm version'));
    }
    
    // Check Git
    try {
      const gitVersion = execSync('git --version', { encoding: 'utf8' }).trim();
      console.log(chalk.green(`✅ Git version: ${gitVersion}`));
    } catch (error) {
      console.warn(chalk.yellow('⚠️  Git not found. Some features may not work properly.'));
    }
  }

  async createDirectories() {
    console.log(chalk.yellow('\n📁 Creating directories...'));
    
    for (const dir of this.requiredDirs) {
      const dirPath = path.join(this.projectRoot, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(chalk.green(`✅ Created: ${dir}`));
      } else {
        console.log(chalk.gray(`ℹ️  Exists: ${dir}`));
      }
    }
  }

  async validateFiles() {
    console.log(chalk.yellow('\n📄 Validating required files...'));
    
    for (const file of this.requiredFiles) {
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        console.log(chalk.green(`✅ Found: ${file}`));
      } else {
        console.warn(chalk.yellow(`⚠️  Missing: ${file}`));
      }
    }
  }

  async installDependencies() {
    console.log(chalk.yellow('\n📦 Installing dependencies...'));
    
    try {
      // Check if node_modules exists
      const nodeModulesPath = path.join(this.projectRoot, 'node_modules');
      if (!fs.existsSync(nodeModulesPath)) {
        console.log(chalk.blue('Installing npm dependencies...'));
        execSync('npm install', { stdio: 'inherit', cwd: this.projectRoot });
      } else {
        console.log(chalk.gray('ℹ️  Dependencies already installed'));
      }
      
      // Install Playwright browsers
      console.log(chalk.blue('Installing Playwright browsers...'));
      execSync('npx playwright install', { stdio: 'inherit', cwd: this.projectRoot });
      
    } catch (error) {
      throw new Error(`Failed to install dependencies: ${error.message}`);
    }
  }

  async setupGitHooks() {
    console.log(chalk.yellow('\n🔧 Setting up Git hooks...'));
    
    try {
      const gitPath = path.join(this.projectRoot, '.git');
      if (fs.existsSync(gitPath)) {
        execSync('npx husky install', { stdio: 'inherit', cwd: this.projectRoot });
        console.log(chalk.green('✅ Git hooks configured'));
      } else {
        console.log(chalk.gray('ℹ️  Not a Git repository, skipping hooks setup'));
      }
    } catch (error) {
      console.warn(chalk.yellow('⚠️  Could not setup Git hooks'));
    }
  }

  async validateConfiguration() {
    console.log(chalk.yellow('\n⚙️  Validating configuration...'));
    
    // Check environment configuration
    const envPath = path.join(this.projectRoot, 'env.config');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      // Check for required environment variables
      const requiredVars = ['BASE_URL', 'BROWSER', 'TIMEOUT'];
      const missingVars = requiredVars.filter(varName => !envContent.includes(varName));
      
      if (missingVars.length > 0) {
        console.warn(chalk.yellow(`⚠️  Missing environment variables: ${missingVars.join(', ')}`));
      } else {
        console.log(chalk.green('✅ Environment configuration valid'));
      }
    }
    
    // Check Cucumber configuration
    const cucumberPath = path.join(this.projectRoot, 'cucumber.js');
    if (fs.existsSync(cucumberPath)) {
      console.log(chalk.green('✅ Cucumber configuration found'));
    }
    
    // Check Playwright configuration
    const playwrightPath = path.join(this.projectRoot, 'playwright.config.js');
    if (fs.existsSync(playwrightPath)) {
      console.log(chalk.green('✅ Playwright configuration found'));
    }
  }

  async runHealthCheck() {
    console.log(chalk.yellow('\n🏥 Running health check...'));
    
    try {
      // Test basic functionality
      const { execSync } = require('child_process');
      
      // Check if cucumber-js is available
      execSync('npx cucumber-js --version', { stdio: 'pipe', cwd: this.projectRoot });
      console.log(chalk.green('✅ Cucumber.js is working'));
      
      // Check if Playwright is available
      execSync('npx playwright --version', { stdio: 'pipe', cwd: this.projectRoot });
      console.log(chalk.green('✅ Playwright is working'));
      
      // Check if ESLint is available
      execSync('npx eslint --version', { stdio: 'pipe', cwd: this.projectRoot });
      console.log(chalk.green('✅ ESLint is working'));
      
    } catch (error) {
      console.warn(chalk.yellow('⚠️  Some tools may not be properly installed'));
    }
  }

  displayNextSteps() {
    console.log(chalk.blue.bold('\n🎯 Next Steps:'));
    console.log(chalk.white('1. Configure your environment variables in env.config'));
    console.log(chalk.white('2. Update the BASE_URL to point to your application'));
    console.log(chalk.white('3. Run smoke tests: npm run test:smoke'));
    console.log(chalk.white('4. Run API tests: npm run test:api'));
    console.log(chalk.white('5. Generate reports: npm run report'));
    
    console.log(chalk.blue.bold('\n📚 Useful Commands:'));
    console.log(chalk.gray('npm test                    # Run all tests'));
    console.log(chalk.gray('npm run test:smoke          # Run smoke tests'));
    console.log(chalk.gray('npm run test:api            # Run API tests'));
    console.log(chalk.gray('npm run test:parallel       # Run tests in parallel'));
    console.log(chalk.gray('npm run report:allure       # Generate Allure reports'));
    console.log(chalk.gray('npm run lint                # Run code linting'));
    console.log(chalk.gray('npm run security:audit      # Run security audit'));
    
    console.log(chalk.blue.bold('\n🐳 Docker Commands:'));
    console.log(chalk.gray('docker-compose up --build   # Run with Docker'));
    console.log(chalk.gray('docker run -it automation-framework npm test'));
    
    console.log(chalk.blue.bold('\n📖 Documentation:'));
    console.log(chalk.gray('README.md                   # Framework documentation'));
    console.log(chalk.gray('QUICK_START.md              # Quick start guide'));
    console.log(chalk.gray('IDE_SETUP.md                # IDE setup guide'));
  }

  compareVersions(version1, version2) {
    const v1 = version1.replace('v', '').split('.').map(Number);
    const v2 = version2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
      const num1 = v1[i] || 0;
      const num2 = v2[i] || 0;
      
      if (num1 > num2) return 1;
      if (num1 < num2) return -1;
    }
    
    return 0;
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  const setup = new FrameworkSetup();
  setup.run().catch(error => {
    console.error(chalk.red.bold('Setup failed:'), error);
    process.exit(1);
  });
}

module.exports = FrameworkSetup; 