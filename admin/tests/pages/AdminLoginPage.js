const { BasePage } = require('./BasePage');

/**
 * Admin Login Page Object
 */
class AdminLoginPage extends BasePage {
  constructor(page) {
    super(page);
    
    this.selectors = {
      // Email input
      emailInput: '[data-testid="admin-email-input"]',
      emailInputAlt: 'input[type="email"]',
      emailInputById: '#email',
      
      // Password input
      passwordInput: '[data-testid="admin-password-input"]',
      passwordInputAlt: 'input[type="password"]',
      passwordInputById: '#password',
      
      // Login button
      loginButton: '[data-testid="admin-login-button"]',
      loginButtonAlt: 'button[type="submit"]',
      loginButtonByText: 'button:has-text("Admin Login")',
      loginButtonByText2: 'button:has-text("Đăng nhập")',
      
      // Error messages
      errorMessage: '[data-testid="error-message"]',
      errorMessageAlt: '.error-message',
      errorMessageAlt2: '.alert-error',
      
      // Admin specific
      adminBadge: '[data-testid="admin-badge"]',
      adminBadgeAlt: '.admin-badge',
      
      // 2FA (nếu admin có 2FA)
      twoFactorInput: '[data-testid="2fa-input"]',
      twoFactorInputAlt: 'input[name="token"]',
      
      verifyButton: '[data-testid="verify-button"]',
      verifyButtonAlt: 'button:has-text("Verify")',
    };
  }

  /**
   * Navigate to admin login page
   */
  async goto() {
    await this.navigate('/admin/login');
    await this.waitForPageLoad();
  }

  /**
   * Fill admin email
   */
  async fillEmail(email) {
    const selectors = [
      this.selectors.emailInput,
      this.selectors.emailInputAlt,
      this.selectors.emailInputById
    ];

    for (const selector of selectors) {
      try {
        await this.fillInput(selector, email);
        console.log(`✓ Admin email filled using: ${selector}`);
        return;
      } catch (error) {
        continue;
      }
    }
    
    throw new Error('Could not find admin email input');
  }

  /**
   * Fill admin password
   */
  async fillPassword(password) {
    const selectors = [
      this.selectors.passwordInput,
      this.selectors.passwordInputAlt,
      this.selectors.passwordInputById
    ];

    for (const selector of selectors) {
      try {
        await this.fillInput(selector, password);
        console.log(`✓ Admin password filled using: ${selector}`);
        return;
      } catch (error) {
        continue;
      }
    }
    
    throw new Error('Could not find admin password input');
  }

  /**
   * Click admin login button
   */
  async clickLoginButton() {
    const selectors = [
      this.selectors.loginButton,
      this.selectors.loginButtonAlt,
      this.selectors.loginButtonByText,
      this.selectors.loginButtonByText2
    ];

    for (const selector of selectors) {
      try {
        await this.clickElement(selector);
        console.log(`✓ Admin login button clicked using: ${selector}`);
        return;
      } catch (error) {
        continue;
      }
    }
    
    throw new Error('Could not find admin login button');
  }

  /**
   * Complete admin login
   */
  async login(email, password) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickLoginButton();
    await this.wait(1000);
  }

  /**
   * Login with 2FA
   */
  async loginWith2FA(email, password, token) {
    await this.login(email, password);
    
    // Wait for 2FA input to appear
    await this.waitForSelector(this.selectors.twoFactorInput, { timeout: 5000 });
    
    // Enter 2FA token
    await this.fillInput(this.selectors.twoFactorInput, token);
    await this.clickElement(this.selectors.verifyButton);
  }

  /**
   * Get error message
   */
  async getErrorMessage() {
    const selectors = [
      this.selectors.errorMessage,
      this.selectors.errorMessageAlt,
      this.selectors.errorMessageAlt2
    ];

    for (const selector of selectors) {
      try {
        await this.waitForSelector(selector, { timeout: 5000 });
        return await this.getText(selector);
      } catch (error) {
        continue;
      }
    }
    
    return null;
  }

  /**
   * Check if error is visible
   */
  async isErrorVisible() {
    const selectors = [
      this.selectors.errorMessage,
      this.selectors.errorMessageAlt,
      this.selectors.errorMessageAlt2
    ];

    for (const selector of selectors) {
      const isVisible = await this.isVisible(selector);
      if (isVisible) return true;
    }
    
    return false;
  }
}

module.exports = { AdminLoginPage };