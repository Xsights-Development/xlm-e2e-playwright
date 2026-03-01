const { BasePage } = require('./BasePage');

/**
 * Login Page Object for App
 */
class LoginPage extends BasePage {
  constructor(page) {
    super(page);

    // Selectors - Adjust based on your project
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

      // Social login buttons (if available)
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
        console.log(`   ✓ Email filled: ${email}`);
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
        console.log(`   ✓ Password filled: ***********`);
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
        console.log(`   ✓ Login button clicked`);
        return;
      } catch (error) {
        continue;
      }
    }
    
    throw new Error('Could not find login button');
  }

  /**
   * Select tenant by identifier (data-tenant-identifier on option). Click tenant-select first to open dropdown.
   * @param {string} tenantIdentifier - Tenant identifier
   */
  async selectTenant(tenantIdentifier) {
    const tenantSelect = this.page.getByTestId('tenant-select');
    await tenantSelect.click();
    await this.page.locator(`[data-tenant-identifier="${tenantIdentifier}"]`).click();
    console.log(`   ✓ Tenant selected: ${tenantIdentifier}`);
  }

  /**
   * Select farm by identifier (data-farm-identifier on option). Click farm-select first to open dropdown.
   * @param {string|number} farmIdentifier - Farm identifier
   */
  async selectFarm(farmIdentifier) {
    const id = farmIdentifier != null ? String(farmIdentifier) : '';
    try {
      const farmSelect = this.page.getByTestId('farm-select');
      await farmSelect.click();
      const option = this.page.locator(`[data-farm-identifier="${id}"]`);
      const visible = await option.isVisible().catch(() => false);
      if (visible) {
        await option.click();
        console.log(`   ✓ Farm selected: ${id}`);
      } else {
        console.log(`   ⚠ Skip selection "${id}" ⚠️`);
      }
    } catch (error) {
      console.log(`   ⚠ Skip selection "${id}" ⚠️`);
    }
  }

  /**
   * Select tenant using custom select component or input field
   */
  async selectTenant_BK(tenant) {
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
  async selectFarm_BK(farm) {
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
      await this.clickElement(`${this.selectors.dashboardButton}, ${this.selectors.nextButton}`);
      console.log('   ✓ Next button clicked');
      // await this.wait(1000); // Wait for transition
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
      console.log('   ✓ Go to Dashboard button clicked');
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
    
    // Wait a bit for response
    await this.wait(1000);
  }

  async selectTenantAndWait(tenantIdentifier, waitTime = 1000) {
    await this.selectTenant(tenantIdentifier);
    await this.clickNext();
    await this.wait(waitTime);
  }
  
  async selectFarmAndWait(farmIdentifier, waitTime = 1000) {
    await this.selectFarm(farmIdentifier);
    await this.clickDashboard();
    await this.wait(waitTime);
  }

  async waitForDashboardLoad() {
    await this.page.waitForURL(/.*dashboard/, { timeout: 15000 });
    console.log('   ✓ Dashboard loaded');
  }

  async selectBarnGroup(barnGroup) {
    const normalizedGroup = barnGroup.toLowerCase();
    const barnGroups = this.page.locator(`text=/${normalizedGroup}/i`).first();
    await barnGroups.click();
    await this.page.waitForTimeout(1000);
    console.log(`   ✓ Barn group "${barnGroup}" selected`);
  }

  async selectBarn(barnId) {
    const barn = this.page.locator(`text=/${barnId}/i`).first();
    await barn.click({ force: true });
    console.log(`✓ Barn "${barnId}" selected`);
  }

  async waitForOverviewLoad() {
    await this.page.waitForURL(/.*overview/, { timeout: 5000 });
    console.log('✓ Overview page loaded');
  } 

  /**
   * Complete full authentication flow including tenant and farm selection (by identifier).
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} tenantIdentifier - Tenant identifier
   * @param {string|number} farmIdentifier - Farm identifier
   */
  async loginWithTenantAndFarm(email, password, tenantIdentifier, farmIdentifier) {
    // Step 1: Login
    await this.login(email, password);
    await this.wait(1000);

    // Step 2: Select tenant and click Next
    await this.selectTenant(tenantIdentifier);
    await this.clickNext();
    await this.wait(1000);

    // Step 3: Select farm and go to dashboard
    await this.selectFarm(farmIdentifier);
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
   * Login with Google (if available)
   */
  async loginWithGoogle() {
    await this.clickElement(this.selectors.googleLoginButton);
  }

  /**
   * Login with Facebook (if available)
   */
  async loginWithFacebook() {
    await this.clickElement(this.selectors.facebookLoginButton);
  }
}

module.exports = { LoginPage };