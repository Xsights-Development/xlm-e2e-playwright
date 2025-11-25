const { BasePage } = require('../base');

/**
 * Login Page Object - Focuses on authentication, tenant/farm selection, and password recovery
 * Reference: tests/app/selectors/loginPageSelectors.md
 */
class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    
    // Selectors based on loginPageSelectors.md
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

      // Tenant selector
      tenantSelect: 'input[name="tenantIdentifier"]',
      tenantSelectAlt: '[data-testid="tenant-identifier"]',

      // Farm selector
      farmSelect: 'input[name="farmIdentifier"]',
      farmSelectAlt: '[data-testid="farm-identifier"]',

      // Next button after tenant selection
      nextButton: 'button:has-text("Next")',

      // Go to Dashboard button after farm selection
      dashboardButton: 'button:has-text("Go to Dashboard")',

      // Error messages
      errorMessage: '[data-testid="error-message"]',
      errorMessageAlt: '.error-message',
      errorMessageAlt2: '.alert-error',
      errorMessageAlt3: '[role="alert"]',
      
      // Forgot password link
      forgotPasswordLink: '[data-testid="forgot-password"]',
      forgotPasswordLinkAlt: 'a:has-text("Forgot Password")',
      forgotPasswordLinkAlt2: 'a:has-text("Quên mật khẩu")',
      
      // Loading indicator
      loadingSpinner: '[data-testid="loading"]',
      loadingSpinnerAlt: '.spinner',
      loadingSpinnerAlt2: '.loading',
    };
  }

  /**
   * Navigate to login page
   */
  async goto() {
    await this.navigate('/sign-in');
    await this.waitForPageLoad();
  }

  /**
   * Fill email input with fallback selectors
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
   * Fill password input with fallback selectors
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
   * Click login button with fallback selectors
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
   * Select tenant using custom select component or input field
   */
  async selectTenant(tenant) {
    // Try custom select first
    try {
      await this.page.click('.tenant-select .select__control');
      await this.page.fill('.tenant-select .select__input input', tenant);
      // Wait for dropdown options to appear and select the first match
      await this.page.waitForSelector('.tenant-select .select__option', { timeout: 5000 });
      const options = await this.page.$$('.tenant-select .select__option');
      for (const option of options) {
        const text = await option.textContent();
        if (text && text.toLowerCase().includes(tenant.toLowerCase())) {
          await option.click();
          console.log('✓ Tenant selected using custom select');
          return;
        }
      }
      throw new Error('Tenant option not found in dropdown');
    } catch (e) {
      // Fallback to input selectors
      const selectors = [
        this.selectors.tenantSelect,
        this.selectors.tenantSelectAlt
      ];
      for (const selector of selectors) {
        try {
          await this.fillInput(selector, tenant);
          console.log(`✓ Tenant selected using selector: ${selector}`);
          return;
        } catch (error) {
          continue;
        }
      }
      throw new Error(`Could not find tenant input field or select to select: ${tenant}`);
    }
  }

  /**
   * Select farm using custom select component or input field
   */
  async selectFarm(farm) {
    // Try custom select first
    try {
      await this.page.click('.farm-select .select__control');
      await this.page.fill('.farm-select .select__input input', farm);
      await this.page.waitForSelector('.farm-select .select__option', { timeout: 5000 });
      const options = await this.page.$$('.farm-select .select__option');
      for (const option of options) {
        const text = await option.textContent();
        if (text && text.toLowerCase().includes(farm.toLowerCase())) {
          await option.click();
          console.log('✓ Farm selected using custom select');
          return;
        }
      }
      throw new Error('Farm option not found in dropdown');
    } catch (e) {
      // Fallback to input selectors
      const selectors = [
        this.selectors.farmSelect,
        this.selectors.farmSelectAlt
      ];
      for (const selector of selectors) {
        try {
          await this.fillInput(selector, farm);
          console.log(`✓ Farm selected using selector: ${selector}`);
          return;
        } catch (error) {
          continue;
        }
      }
      throw new Error(`Could not find farm input field or select to select: ${farm}`);
    }
  }

  /**
   * Click Next button after selecting tenant
   */
  async clickNext() {
    try {
      await this.clickElement(this.selectors.nextButton);
      console.log('✓ Next button clicked');
      await this.wait(1000); // Wait for transition
    } catch (error) {
      throw new Error('Could not find Next button');
    }
  }

  /**
   * Click Go to Dashboard button after selecting farm
   */
  async clickDashboard() {
    try {
      await this.clickElement(this.selectors.dashboardButton);
      console.log('✓ Go to Dashboard button clicked');
      await this.wait(1000); // Wait for navigation
    } catch (error) {
      throw new Error('Could not find Go to Dashboard button');
    }
  }

  /**
   * Complete login flow - fill credentials and click login
   */
  async login(email, password) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickLoginButton();
    
    // Wait for response
    await this.wait(1000);
  }

  /**
   * Complete full authentication flow including tenant and farm selection
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} tenant - Tenant name
   * @param {string} farm - Farm name
   */
  async loginWithTenantAndFarm(email, password, tenant, farm) {
    // Step 1: Login
    await this.login(email, password);
    await this.wait(1000);

    // Step 2: Select tenant and click Next
    await this.selectTenant(tenant);
    await this.clickNext();
    await this.wait(1000);

    // Step 3: Select farm and go to dashboard
    await this.selectFarm(farm);
    await this.clickDashboard();
    
    console.log('✓ Full authentication flow completed');
  }

  /**
   * Login and wait for navigation to specific URL
   */
  async loginAndWait(email, password, expectedURL = '/dashboard') {
    await this.login(email, password);
    await this.page.waitForURL(`**${expectedURL}`, { timeout: 15000 });
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
        console.log('✓ Forgot password link clicked');
        return;
      } catch (error) {
        continue;
      }
    }
    
    throw new Error('Could not find forgot password link');
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
        console.log('✓ Loading finished');
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
}

module.exports = { LoginPage };
