class LoginSelectors {
  // Login page elements
  static LOGIN_LINK = '.ico-login';
  static EMAIL_INPUT = '#Email';
  static PASSWORD_INPUT = '#Password';
  static LOGIN_BUTTON = 'input[type="submit"][value="Log in"]';
  static REMEMBER_ME_CHECKBOX = '#RememberMe';
  static FORGOT_PASSWORD_LINK = '.forgot-password';
  
  // Error messages
  static ERROR_MESSAGE = '.validation-summary-errors';
  static EMAIL_ERROR = '#Email-error';
  static PASSWORD_ERROR = '#Password-error';
  
  // Success elements
  static WELCOME_MESSAGE = '.header-links .account';
  static LOGOUT_LINK = '.ico-logout';
  
  // Page navigation
  static LOGIN_PAGE_TITLE = 'h1';
  static RETURNING_CUSTOMER_SECTION = '.returning-wrapper';
  
  // Form elements
  static LOGIN_FORM = 'form';
  static EMAIL_LABEL = 'label[for="Email"]';
  static PASSWORD_LABEL = 'label[for="Password"]';
  
  // Registration elements
  static REGISTER_BUTTON = '#register-button';
  static CONFIRM_PASSWORD_INPUT = '#ConfirmPassword';
}

module.exports = LoginSelectors; 