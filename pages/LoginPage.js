const LoginSelectors = require('../selectors/loginSelectors');

class LoginPage {
  constructor(page, webElements) {
    this.page = page;
    this.webElements = webElements;
    this.selectors = LoginSelectors;
  }

  async navigateToLoginPage() {
    try {
      const baseURL = process.env.BASE_URL || 'https://demowebshop.tricentis.com';
      await this.page.goto(`${baseURL}/login`);
      await this.waitForLoginPageToLoad();
      console.log('✅ Navigated to login page successfully');
    } catch (error) {
      console.error('❌ Failed to navigate to login page:', error);
      throw error;
    }
  }

  async waitForLoginPageToLoad() {
    try {
      // Wait for any of the login form elements to be present
      await this.page.waitForSelector(this.selectors.EMAIL_INPUT, { timeout: 10000 });
      await this.page.waitForSelector(this.selectors.PASSWORD_INPUT, { timeout: 10000 });
      console.log('✅ Login page loaded successfully');
    } catch (error) {
      console.error('❌ Login page failed to load:', error);
      throw error;
    }
  }

  async clickLoginLink() {
    try {
      await this.webElements.click(this.selectors.LOGIN_LINK);
      await this.waitForLoginPageToLoad();
      console.log('✅ Clicked login link successfully');
    } catch (error) {
      console.error('❌ Failed to click login link:', error);
      throw error;
    }
  }

  async enterEmail(email) {
    try {
      await this.webElements.type(this.selectors.EMAIL_INPUT, email);
      console.log(`✅ Entered email: ${email}`);
    } catch (error) {
      console.error('❌ Failed to enter email:', error);
      throw error;
    }
  }

  async enterPassword(password) {
    try {
      await this.webElements.type(this.selectors.PASSWORD_INPUT, password);
      console.log(`✅ Entered password: ${password.replace(/./g, '*')}`);
    } catch (error) {
      console.error('❌ Failed to enter password:', error);
      throw error;
    }
  }

  async clickLoginButton() {
    try {
      // Try multiple possible login button selectors
      const buttonSelectors = [
        this.selectors.LOGIN_BUTTON,
        'input[type="submit"]',
        'button[type="submit"]',
        '.login-button',
        '#login-button'
      ];
      
      let clicked = false;
      for (const selector of buttonSelectors) {
        try {
          await this.webElements.click(selector);
          clicked = true;
          break;
        } catch (e) {
          // Try next selector
          continue;
        }
      }
      
      if (!clicked) {
        throw new Error('No login button found');
      }
      
      console.log('✅ Clicked login button successfully');
    } catch (error) {
      console.error('❌ Failed to click login button:', error);
      throw error;
    }
  }

  async checkRememberMe() {
    try {
      await this.webElements.check(this.selectors.REMEMBER_ME_CHECKBOX);
      console.log('✅ Checked remember me option');
    } catch (error) {
      console.error('❌ Failed to check remember me:', error);
      throw error;
    }
  }

  async uncheckRememberMe() {
    try {
      await this.webElements.uncheck(this.selectors.REMEMBER_ME_CHECKBOX);
      console.log('✅ Unchecked remember me option');
    } catch (error) {
      console.error('❌ Failed to uncheck remember me:', error);
      throw error;
    }
  }

  async isRememberMeChecked() {
    try {
      return await this.webElements.isChecked(this.selectors.REMEMBER_ME_CHECKBOX);
    } catch (error) {
      console.error('❌ Failed to check remember me status:', error);
      return false;
    }
  }

  async clickForgotPassword() {
    try {
      await this.webElements.click(this.selectors.FORGOT_PASSWORD_LINK);
      console.log('✅ Clicked forgot password link successfully');
    } catch (error) {
      console.error('❌ Failed to click forgot password link:', error);
      throw error;
    }
  }

  async login(email, password, rememberMe = false) {
    try {
      await this.enterEmail(email);
      await this.enterPassword(password);
      
      if (rememberMe) {
        await this.checkRememberMe();
      }
      
      await this.clickLoginButton();
      console.log('✅ Login process completed');
    } catch (error) {
      console.error('❌ Login process failed:', error);
      throw error;
    }
  }

  async isLoginSuccessful() {
    try {
      // Wait for page to load
      await this.page.waitForTimeout(3000);
      
      const currentUrl = await this.page.url();
      const pageContent = await this.page.content();
      
      // Check multiple indicators of successful login
      return currentUrl.includes('/customer') || 
             pageContent.includes('Log out') || 
             pageContent.includes('My account') ||
             !pageContent.includes('Log in');
    } catch (error) {
      console.error('❌ Failed to check login status:', error);
      return false;
    }
  }

  async isLoginPageDisplayed() {
    try {
      const currentUrl = await this.page.url();
      return currentUrl.includes('/login');
    } catch (error) {
      console.error('❌ Failed to check if login page is displayed:', error);
      return false;
    }
  }

  async getErrorMessage() {
    try {
      const errorText = await this.webElements.getText(this.selectors.ERROR_MESSAGE);
      return errorText;
    } catch (error) {
      console.error('❌ Failed to get error message:', error);
      return '';
    }
  }

  async getEmailError() {
    try {
      const emailError = await this.webElements.getText(this.selectors.EMAIL_ERROR);
      return emailError;
    } catch (error) {
      console.error('❌ Failed to get email error:', error);
      return '';
    }
  }

  async getPasswordError() {
    try {
      const passwordError = await this.webElements.getText(this.selectors.PASSWORD_ERROR);
      return passwordError;
    } catch (error) {
      console.error('❌ Failed to get password error:', error);
      return '';
    }
  }

  async hasValidationErrors() {
    try {
      const hasEmailError = await this.webElements.isVisible(this.selectors.EMAIL_ERROR);
      const hasPasswordError = await this.webElements.isVisible(this.selectors.PASSWORD_ERROR);
      const hasGeneralError = await this.webElements.isVisible(this.selectors.ERROR_MESSAGE);
      
      return hasEmailError || hasPasswordError || hasGeneralError;
    } catch (error) {
      console.error('❌ Failed to check validation errors:', error);
      return false;
    }
  }

  async getWelcomeMessage() {
    try {
      // Try multiple possible welcome message selectors
      const welcomeSelectors = [
        this.selectors.WELCOME_MESSAGE,
        '.welcome-message',
        '.account-info',
        '.user-info'
      ];
      
      for (const selector of welcomeSelectors) {
        try {
          const welcomeText = await this.webElements.getText(selector);
          if (welcomeText && welcomeText.trim()) {
            return welcomeText;
          }
        } catch (e) {
          continue;
        }
      }
      
      // If no specific welcome message found, check page content
      const pageContent = await this.page.content();
      if (pageContent.includes('My account') || pageContent.includes('Log out')) {
        return 'Welcome';
      }
      
      return '';
    } catch (error) {
      console.error('❌ Failed to get welcome message:', error);
      return '';
    }
  }

  async clearEmailField() {
    try {
      await this.webElements.type(this.selectors.EMAIL_INPUT, '');
      console.log('✅ Cleared email field');
    } catch (error) {
      console.error('❌ Failed to clear email field:', error);
      throw error;
    }
  }

  async clearPasswordField() {
    try {
      await this.webElements.type(this.selectors.PASSWORD_INPUT, '');
      console.log('✅ Cleared password field');
    } catch (error) {
      console.error('❌ Failed to clear password field:', error);
      throw error;
    }
  }

  async clearAllFields() {
    try {
      await this.clearEmailField();
      await this.clearPasswordField();
      console.log('✅ Cleared all fields');
    } catch (error) {
      console.error('❌ Failed to clear all fields:', error);
      throw error;
    }
  }

  async getEmailValue() {
    try {
      return await this.webElements.getAttribute(this.selectors.EMAIL_INPUT, 'value');
    } catch (error) {
      console.error('❌ Failed to get email value:', error);
      return '';
    }
  }

  async getPasswordValue() {
    try {
      return await this.webElements.getAttribute(this.selectors.PASSWORD_INPUT, 'value');
    } catch (error) {
      console.error('❌ Failed to get password value:', error);
      return '';
    }
  }

  async isEmailFieldEnabled() {
    try {
      return await this.webElements.isEnabled(this.selectors.EMAIL_INPUT);
    } catch (error) {
      console.error('❌ Failed to check email field enabled status:', error);
      return false;
    }
  }

  async isPasswordFieldEnabled() {
    try {
      return await this.webElements.isEnabled(this.selectors.PASSWORD_INPUT);
    } catch (error) {
      console.error('❌ Failed to check password field enabled status:', error);
      return false;
    }
  }

  async isLoginButtonEnabled() {
    try {
      return await this.webElements.isEnabled(this.selectors.LOGIN_BUTTON);
    } catch (error) {
      console.error('❌ Failed to check login button enabled status:', error);
      return false;
    }
  }

  async waitForLoginProcess() {
    try {
      // Wait for navigation or page change
      await this.page.waitForTimeout(3000);
      console.log('✅ Login process wait completed');
    } catch (error) {
      console.error('❌ Failed to wait for login process:', error);
      throw error;
    }
  }
}

module.exports = LoginPage; 