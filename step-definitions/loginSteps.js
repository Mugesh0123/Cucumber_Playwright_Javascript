const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const LoginPage = require('../pages/LoginPage');

Given('I am on the login page', async function () {
  try {
    this.loginPage = new LoginPage(this.page, this.webElements);
    await this.loginPage.navigateToLoginPage();
    console.log('✅ Successfully navigated to login page');
  } catch (error) {
    console.error('❌ Failed to navigate to login page:', error);
    throw error;
  }
});

Given('I have a registered user account', async function () {
  try {
    // Navigate to registration page
    const baseURL = process.env.BASE_URL || 'https://demowebshop.tricentis.com';
    await this.page.goto(`${baseURL}/register`);
    
    // Fill registration form
    const testEmail = process.env.TEST_USER_EMAIL || 'testuser@example.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'Test123!';
    
    await this.webElements.type('#Email', testEmail);
    await this.webElements.type('#Password', testPassword);
    await this.webElements.type('#ConfirmPassword', testPassword);
    await this.webElements.click('#register-button');
    
    // Wait for registration to complete
    await this.page.waitForTimeout(3000);
    
    console.log('✅ User registration completed');
  } catch (error) {
    console.log('ℹ️ User might already be registered or registration failed:', error.message);
    // Continue with the test even if registration fails (user might already exist)
  }
});

When('I enter valid email {string}', async function (email) {
  try {
    // Handle environment variable substitution
    const actualEmail = email.replace('${TEST_USER_EMAIL}', process.env.TEST_USER_EMAIL || 'testuser@example.com');
    await this.loginPage.enterEmail(actualEmail);
    console.log(`✅ Entered valid email: ${actualEmail}`);
  } catch (error) {
    console.error('❌ Failed to enter valid email:', error);
    throw error;
  }
});

When('I enter valid password {string}', async function (password) {
  try {
    // Handle environment variable substitution
    const actualPassword = password.replace('${TEST_USER_PASSWORD}', process.env.TEST_USER_PASSWORD || 'Test123!');
    await this.loginPage.enterPassword(actualPassword);
    console.log('✅ Entered valid password');
  } catch (error) {
    console.error('❌ Failed to enter valid password:', error);
    throw error;
  }
});

When('I enter email {string}', async function (email) {
  try {
    await this.loginPage.enterEmail(email);
    console.log(`✅ Entered email: ${email}`);
  } catch (error) {
    console.error('❌ Failed to enter email:', error);
    throw error;
  }
});

When('I enter password {string}', async function (password) {
  try {
    await this.loginPage.enterPassword(password);
    console.log('✅ Entered password');
  } catch (error) {
    console.error('❌ Failed to enter password:', error);
    throw error;
  }
});

When('I click the login button', async function () {
  try {
    await this.loginPage.clickLoginButton();
    await this.loginPage.waitForLoginProcess();
    console.log('✅ Clicked login button');
  } catch (error) {
    console.error('❌ Failed to click login button:', error);
    throw error;
  }
});

When('I click the login button without entering credentials', async function () {
  try {
    await this.loginPage.clickLoginButton();
    console.log('✅ Clicked login button without credentials');
  } catch (error) {
    console.error('❌ Failed to click login button without credentials:', error);
    throw error;
  }
});

When('I check the remember me option', async function () {
  try {
    await this.loginPage.checkRememberMe();
    console.log('✅ Checked remember me option');
  } catch (error) {
    console.error('❌ Failed to check remember me option:', error);
    throw error;
  }
});

When('I uncheck the remember me option', async function () {
  try {
    await this.loginPage.uncheckRememberMe();
    console.log('✅ Unchecked remember me option');
  } catch (error) {
    console.error('❌ Failed to uncheck remember me option:', error);
    throw error;
  }
});

When('I click the forgot password link', async function () {
  try {
    await this.loginPage.clickForgotPassword();
    console.log('✅ Clicked forgot password link');
  } catch (error) {
    console.error('❌ Failed to click forgot password link:', error);
    throw error;
  }
});

When('I clear the email field', async function () {
  try {
    await this.loginPage.clearEmailField();
    console.log('✅ Cleared email field');
  } catch (error) {
    console.error('❌ Failed to clear email field:', error);
    throw error;
  }
});

When('I clear the password field', async function () {
  try {
    await this.loginPage.clearPasswordField();
    console.log('✅ Cleared password field');
  } catch (error) {
    console.error('❌ Failed to clear password field:', error);
    throw error;
  }
});

When('I clear all form fields', async function () {
  try {
    await this.loginPage.clearAllFields();
    console.log('✅ Cleared all form fields');
  } catch (error) {
    console.error('❌ Failed to clear form fields:', error);
    throw error;
  }
});

Then('I should be successfully logged in', async function () {
  try {
    const isLoggedIn = await this.loginPage.isLoginSuccessful();
    expect(isLoggedIn).to.be.true;
    console.log('✅ Login was successful');
  } catch (error) {
    console.error('❌ Login was not successful:', error);
    throw error;
  }
});

Then('I should see the welcome message', async function () {
  try {
    const welcomeMessage = await this.loginPage.getWelcomeMessage();
    expect(welcomeMessage).to.not.be.empty;
    console.log(`✅ Welcome message displayed: ${welcomeMessage}`);
  } catch (error) {
    console.error('❌ Welcome message not displayed:', error);
    throw error;
  }
});

Then('I should see an error message', async function () {
  try {
    const errorMessage = await this.loginPage.getErrorMessage();
    expect(errorMessage).to.not.be.empty;
    console.log(`✅ Error message displayed: ${errorMessage}`);
  } catch (error) {
    console.error('❌ Error message not displayed:', error);
    throw error;
  }
});

Then('I should remain on the login page', async function () {
  try {
    const isLoginPageDisplayed = await this.loginPage.isLoginPageDisplayed();
    expect(isLoginPageDisplayed).to.be.true;
    console.log('✅ Remained on login page');
  } catch (error) {
    console.error('❌ Not on login page:', error);
    throw error;
  }
});

Then('I should see validation error messages', async function () {
  try {
    const hasValidationErrors = await this.loginPage.hasValidationErrors();
    expect(hasValidationErrors).to.be.true;
    console.log('✅ Validation error messages displayed');
  } catch (error) {
    console.error('❌ Validation error messages not displayed:', error);
    throw error;
  }
});

Then('the remember me option should be checked', async function () {
  try {
    const isRememberMeChecked = await this.loginPage.isRememberMeChecked();
    expect(isRememberMeChecked).to.be.true;
    console.log('✅ Remember me option is checked');
  } catch (error) {
    console.error('❌ Remember me option is not checked:', error);
    throw error;
  }
});

Then('the remember me option should be unchecked', async function () {
  try {
    const isRememberMeChecked = await this.loginPage.isRememberMeChecked();
    expect(isRememberMeChecked).to.be.false;
    console.log('✅ Remember me option is unchecked');
  } catch (error) {
    console.error('❌ Remember me option is checked when it should not be:', error);
    throw error;
  }
});

Then('I should see email validation error', async function () {
  try {
    const emailError = await this.loginPage.getEmailError();
    expect(emailError).to.not.be.empty;
    console.log(`✅ Email validation error: ${emailError}`);
  } catch (error) {
    console.error('❌ Email validation error not displayed:', error);
    throw error;
  }
});

Then('I should see password validation error', async function () {
  try {
    const passwordError = await this.loginPage.getPasswordError();
    expect(passwordError).to.not.be.empty;
    console.log(`✅ Password validation error: ${passwordError}`);
  } catch (error) {
    console.error('❌ Password validation error not displayed:', error);
    throw error;
  }
});

Then('the email field should be empty', async function () {
  try {
    const emailValue = await this.loginPage.getEmailValue();
    expect(emailValue).to.be.empty;
    console.log('✅ Email field is empty');
  } catch (error) {
    console.error('❌ Email field is not empty:', error);
    throw error;
  }
});

Then('the password field should be empty', async function () {
  try {
    const passwordValue = await this.loginPage.getPasswordValue();
    expect(passwordValue).to.be.empty;
    console.log('✅ Password field is empty');
  } catch (error) {
    console.error('❌ Password field is not empty:', error);
    throw error;
  }
});

Then('the email field should be enabled', async function () {
  try {
    const isEmailEnabled = await this.loginPage.isEmailFieldEnabled();
    expect(isEmailEnabled).to.be.true;
    console.log('✅ Email field is enabled');
  } catch (error) {
    console.error('❌ Email field is not enabled:', error);
    throw error;
  }
});

Then('the password field should be enabled', async function () {
  try {
    const isPasswordEnabled = await this.loginPage.isPasswordFieldEnabled();
    expect(isPasswordEnabled).to.be.true;
    console.log('✅ Password field is enabled');
  } catch (error) {
    console.error('❌ Password field is not enabled:', error);
    throw error;
  }
});

Then('the login button should be enabled', async function () {
  try {
    const isLoginButtonEnabled = await this.loginPage.isLoginButtonEnabled();
    expect(isLoginButtonEnabled).to.be.true;
    console.log('✅ Login button is enabled');
  } catch (error) {
    console.error('❌ Login button is not enabled:', error);
    throw error;
  }
});

Then('I should be redirected to the forgot password page', async function () {
  try {
    const currentUrl = await this.page.url();
    expect(currentUrl).to.include('forgot-password');
    console.log('✅ Redirected to forgot password page');
  } catch (error) {
    console.error('❌ Not redirected to forgot password page:', error);
    throw error;
  }
});

// Additional step definitions for better test coverage
When('I login with email {string} and password {string}', async function (email, password) {
  try {
    await this.loginPage.login(email, password);
    console.log('✅ Login action completed');
  } catch (error) {
    console.error('❌ Login action failed:', error);
    throw error;
  }
});

When('I login with email {string} and password {string} and remember me', async function (email, password) {
  try {
    await this.loginPage.login(email, password, true);
    console.log('✅ Login action with remember me completed');
  } catch (error) {
    console.error('❌ Login action with remember me failed:', error);
    throw error;
  }
});

Then('the login form should be visible', async function () {
  try {
    const isFormVisible = await this.webElements.isVisible(this.loginPage.selectors.LOGIN_FORM);
    expect(isFormVisible).to.be.true;
    console.log('✅ Login form is visible');
  } catch (error) {
    console.error('❌ Login form is not visible:', error);
    throw error;
  }
});

Then('the returning customer section should be visible', async function () {
  try {
    const isSectionVisible = await this.webElements.isVisible(this.loginPage.selectors.RETURNING_CUSTOMER_SECTION);
    expect(isSectionVisible).to.be.true;
    console.log('✅ Returning customer section is visible');
  } catch (error) {
    console.error('❌ Returning customer section is not visible:', error);
    throw error;
  }
}); 