// app/tests/pages/LoginPage.js
const { BasePage } = require('./BasePage');

/**
 * Login Page Object cho App
 */
class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    
    // Selectors - Thay đổi theo dự án của bạn
    this.selectors = {
      // Email input
      emailInput: '[data-testid="email-input"]',
      emailInputAlt: 'input[type="email"]',
      emailInputById: '#email',
      emailInputByName: 'input[name="email"]',
      
      // Password input
      passwordInput: '[data-testid="password-input"]',
      passwordInputAlt: 'input[type="password"]',
      passwordInputById: '#password',
      passwordInputByName: 'input[name="password"]',
      
      // Login button
      loginButton: '[data-testid="login-button"]',
      loginButtonAlt: 'button[type="submit"]',
      loginButtonByText: 'button:has-text("Login")',
      loginButtonByText2: 'button:has-text("Đăng nhập")',
      
      // Error messages
      errorMessage: '[data-testid="error-message"]',
      errorMessageAlt: '.error-message',
      errorMessageAlt2: '.alert-error',
      errorMessageAlt3: '[role="alert"]',
      
      // Links
      forgotPasswordLink: '[data-testid="forgot-password"]',
      forgotPasswordLinkAlt: 'a:has-text("Forgot Password")',
      forgotPasswordLinkAlt2: 'a:has-text("Quên mật khẩu")',
      
      signupLink: '[data-testid="signup-link"]',
      signupLinkAlt: 'a:has-text("Sign Up")',
      signupLinkAlt2: 'a:has-text("Đăng ký")',
      
      // Other elements
      rememberMeCheckbox: '[data-testid="remember-me"]',
      rememberMeCheckboxAlt: 'input[type="checkbox"]',
      
      loadingSpinner: '[data-testid="loading"]',
      loadingSpinnerAlt: '.spinner',
      loadingSpinnerAlt2: '.loading',
      
      // Social login buttons (nếu có)
      googleLoginButton: '[data-testid="google-login"]',
      facebookLoginButton: '[data-testid="facebook-login"]',
    };
  }

  /**
   * Navigate to login page
   */
  async goto() {
    await this.navigate('/login');
    await this.waitForPageLoad();
  }

  /**
   * Fill email input với fallback selectors
   */
  async fillEmail(email) {
    const selectors = [
      this.selectors.emailInput,
      this.selectors.emailInputAlt,
      this.selectors.emailInputById,
      this.selectors.emailInputByName
    ];

    for (const selector of selectors) {
      try {
        await this.fillInput(selector, email);
        console.log(`✓ Email filled using selector: ${selector}`);
        return;
      } catch (error) {
        continue;
      }
    }
    
    throw new Error('Could not find email input field');
  }

  /**
   * Fill password input với fallback selectors
   */
  async fillPassword(password) {
    const selectors = [
      this.selectors.passwordInput,
      this.selectors.passwordInputAlt,
      this.selectors.passwordInputById,
      this.selectors.passwordInputByName
    ];

    for (const selector of selectors) {
      try {
        await this.fillInput(selector, password);
        console.log(`✓ Password filled using selector: ${selector}`);
        return;
      } catch (error) {
        continue;
      }
    }
    
    throw new Error('Could not find password input field');
  }

  /**
   * Click login button với fallback selectors
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
        console.log(`✓ Login button clicked using selector: ${selector}`);
        return;
      } catch (error) {
        continue;
      }
    }
    
    throw new Error('Could not find login button');
  }

  /**
   * Complete login flow
   */
  async login(email, password) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickLoginButton();
    
    // Wait a bit for response
    await this.wait(1000);
  }

  /**
   * Login and wait for navigation to specific URL
   */
  async loginAndWait(email, password, expectedURL = '/dashboard') {
    await this.login(email, password);
    await this.page.waitForURL(`**${expectedURL}`, { timeout: 15000 });
  }

  /**
   * Login and wait for element to appear (more reliable)
   */
  async loginAndWaitForElement(email, password, elementSelector) {
    await this.login(email, password);
    await this.waitForSelector(elementSelector, { timeout: 15000 });
  }

  /**
   * Get error message text
   */
  async getErrorMessage() {
    const selectors = [
      this.selectors.errorMessage,
      this.selectors.errorMessageAlt,
      this.selectors.errorMessageAlt2,
      this.selectors.errorMessageAlt3
    ];

    for (const selector of selectors) {
      try {
        await this.waitForSelector(selector, { timeout: 5000 });
        const text = await this.getText(selector);
        console.log(`✓ Error message found: "${text}"`);
        return text;
      } catch (error) {
        continue;
      }
    }
    
    return null;
  }

  /**
   * Check if error message is visible
   */
  async isErrorVisible() {
    const selectors = [
      this.selectors.errorMessage,
      this.selectors.errorMessageAlt,
      this.selectors.errorMessageAlt2,
      this.selectors.errorMessageAlt3
    ];

    for (const selector of selectors) {
      const isVisible = await this.isVisible(selector);
      if (isVisible) {
        console.log(`✓ Error message visible at: ${selector}`);
        return true;
      }
    }
    
    return false;
  }

  /**
   * Click forgot password link
   */
  async clickForgotPassword() {
    const selectors = [
      this.selectors.forgotPasswordLink,
      this.selectors.forgotPasswordLinkAlt,
      this.selectors.forgotPasswordLinkAlt2
    ];

    for (const selector of selectors) {
      try {
        await this.clickElement(selector);
        return;
      } catch (error) {
        continue;
      }
    }
    
    throw new Error('Could not find forgot password link');
  }

  /**
   * Click signup link
   */
  async clickSignup() {
    const selectors = [
      this.selectors.signupLink,
      this.selectors.signupLinkAlt,
      this.selectors.signupLinkAlt2
    ];

    for (const selector of selectors) {
      try {
        await this.clickElement(selector);
        return;
      } catch (error) {
        continue;
      }
    }
    
    throw new Error('Could not find signup link');
  }

  /**
   * Check remember me checkbox
   */
  async checkRememberMe() {
    const selectors = [
      this.selectors.rememberMeCheckbox,
      this.selectors.rememberMeCheckboxAlt
    ];

    for (const selector of selectors) {
      try {
        await this.check(selector);
        return;
      } catch (error) {
        continue;
      }
    }
  }

  /**
   * Wait for loading to finish
   */
  async waitForLoadingToFinish() {
    const selectors = [
      this.selectors.loadingSpinner,
      this.selectors.loadingSpinnerAlt,
      this.selectors.loadingSpinnerAlt2
    ];

    for (const selector of selectors) {
      try {
        await this.waitForSelectorHidden(selector, { timeout: 15000 });
        console.log(`✓ Loading finished`);
        return;
      } catch (error) {
        continue;
      }
    }
  }

  /**
   * Check if login button is disabled
   */
  async isLoginButtonDisabled() {
    const selectors = [
      this.selectors.loginButton,
      this.selectors.loginButtonAlt
    ];

    for (const selector of selectors) {
      try {
        const disabled = await this.getAttribute(selector, 'disabled');
        return disabled !== null;
      } catch (error) {
        continue;
      }
    }
    
    return false;
  }

  /**
   * Get email input value
   */
  async getEmailValue() {
    const selectors = [
      this.selectors.emailInput,
      this.selectors.emailInputAlt
    ];

    for (const selector of selectors) {
      try {
        return await this.getInputValue(selector);
      } catch (error) {
        continue;
      }
    }
    
    return '';
  }

  /**
   * Clear email input
   */
  async clearEmail() {
    const selectors = [
      this.selectors.emailInput,
      this.selectors.emailInputAlt
    ];

    for (const selector of selectors) {
      try {
        await this.clearInput(selector);
        return;
      } catch (error) {
        continue;
      }
    }
  }

  /**
   * Clear password input
   */
  async clearPassword() {
    const selectors = [
      this.selectors.passwordInput,
      this.selectors.passwordInputAlt
    ];

    for (const selector of selectors) {
      try {
        await this.clearInput(selector);
        return;
      } catch (error) {
        continue;
      }
    }
  }

  /**
   * Login with Google (nếu có)
   */
  async loginWithGoogle() {
    await this.clickElement(this.selectors.googleLoginButton);
  }

  /**
   * Login with Facebook (nếu có)
   */
  async loginWithFacebook() {
    await this.clickElement(this.selectors.facebookLoginButton);
  }
}

module.exports = { LoginPage };