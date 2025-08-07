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
      await this.webElements.waitForElement(this.selectors.LOGIN_PAGE_TITLE);
      await this.webElements.waitForElement(this.selectors.EMAIL_INPUT);
      await this.webElements.waitForElement(this.selectors.PASSWORD_INPUT);
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
      await this.webElements.click(this.selectors.LOGIN_BUTTON);
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
      console.log('✅ Clicked forgot password link');
    } catch (error) {
      console.error('❌ Failed to click forgot password:', error);
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
      console.log('✅ Login action completed successfully');
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  }

  async isLoginSuccessful() {
    try {
      // Wait for either success or error indicators
      await this.page.waitForTimeout(3000);
      
      // Check for multiple success indicators
      const successIndicators = [
        this.selectors.WELCOME_MESSAGE,
        this.selectors.LOGOUT_LINK,
        '.ico-logout', // Alternative logout selector
        '.account', // Account link
        '.header-links .account', // Header account link
        'a[href="/customer/info"]', // Customer info link
        '.top-menu .account' // Top menu account
      ];
      
      // Check if any success indicator is visible
      for (const selector of successIndicators) {
        try {
          const isVisible = await this.webElements.isVisible(selector);
          if (isVisible) {
            console.log(`✅ Login success detected with selector: ${selector}`);
            return true;
          }
        } catch (error) {
          // Continue checking other selectors
          continue;
        }
      }
      
      // Check if we're still on the login page (failure indicator)
      const isStillOnLoginPage = await this.isLoginPageDisplayed();
      if (isStillOnLoginPage) {
        console.log('❌ Still on login page - login failed');
        return false;
      }
      
      // Check if we're redirected to a different page (success indicator)
      const currentUrl = await this.page.url();
      if (!currentUrl.includes('/login') && !currentUrl.includes('Login')) {
        console.log(`✅ Redirected to: ${currentUrl} - login likely successful`);
        return true;
      }
      
      console.log('❌ Login success could not be determined');
      return false;
    } catch (error) {
      console.error('❌ Failed to check login success:', error);
      return false;
    }
  }

  async isLoginPageDisplayed() {
    try {
      return await this.webElements.isVisible(this.selectors.LOGIN_PAGE_TITLE);
    } catch (error) {
      console.error('❌ Failed to check if login page is displayed:', error);
      return false;
    }
  }

  async getErrorMessage() {
    try {
      const errorText = await this.webElements.getText(this.selectors.ERROR_MESSAGE);
      console.log(`📝 Error message: ${errorText}`);
      return errorText;
    } catch (error) {
      console.error('❌ Failed to get error message:', error);
      return '';
    }
  }

  async getEmailError() {
    try {
      const emailError = await this.webElements.getText(this.selectors.EMAIL_ERROR);
      console.log(`📝 Email error: ${emailError}`);
      return emailError;
    } catch (error) {
      console.error('❌ Failed to get email error:', error);
      return '';
    }
  }

  async getPasswordError() {
    try {
      const passwordError = await this.webElements.getText(this.selectors.PASSWORD_ERROR);
      console.log(`📝 Password error: ${passwordError}`);
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
      // Try multiple selectors for welcome message
      const welcomeSelectors = [
        this.selectors.WELCOME_MESSAGE,
        '.header-links .account',
        '.account',
        '.top-menu .account',
        'a[href="/customer/info"]'
      ];
      
      for (const selector of welcomeSelectors) {
        try {
          const welcomeText = await this.webElements.getText(selector);
          if (welcomeText && welcomeText.trim()) {
            console.log(`📝 Welcome message: ${welcomeText}`);
            return welcomeText;
          }
        } catch (error) {
          // Continue to next selector
          continue;
        }
      }
      
      console.log('📝 No welcome message found');
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
      console.log('✅ Cleared all form fields');
    } catch (error) {
      console.error('❌ Failed to clear form fields:', error);
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
      console.error('❌ Failed to check email field status:', error);
      return false;
    }
  }

  async isPasswordFieldEnabled() {
    try {
      return await this.webElements.isEnabled(this.selectors.PASSWORD_INPUT);
    } catch (error) {
      console.error('❌ Failed to check password field status:', error);
      return false;
    }
  }

  async isLoginButtonEnabled() {
    try {
      return await this.webElements.isEnabled(this.selectors.LOGIN_BUTTON);
    } catch (error) {
      console.error('❌ Failed to check login button status:', error);
      return false;
    }
  }

  async waitForLoginProcess() {
    try {
      // Wait for either success or error to appear
      await this.page.waitForTimeout(3000);
      console.log('✅ Waited for login process to complete');
    } catch (error) {
      console.error('❌ Failed to wait for login process:', error);
    }
  }
}

module.exports = LoginPage; 