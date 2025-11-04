const { BasePage } = require('../../shared/pages/BasePage');

/**
 * Settings Page Object cho Admin
 */
class SettingsPage extends BasePage {
  constructor(page) {
    super(page);
    
    this.selectors = {
      // Page title
      pageTitle: '[data-testid="settings-title"]',
      pageTitleAlt: 'h1:has-text("Settings")',
      
      // Tabs
      generalTab: '[data-testid="general-tab"]',
      generalTabAlt: 'button:has-text("General")',
      
      securityTab: '[data-testid="security-tab"]',
      securityTabAlt: 'button:has-text("Security")',
      
      notificationTab: '[data-testid="notification-tab"]',
      notificationTabAlt: 'button:has-text("Notifications")',
      
      // General settings
      siteNameInput: '[data-testid="site-name"]',
      siteNameInputAlt: 'input[name="siteName"]',
      
      siteDescriptionInput: '[data-testid="site-description"]',
      siteDescriptionInputAlt: 'textarea[name="description"]',
      
      // Security settings
      enableTwoFactorToggle: '[data-testid="enable-2fa"]',
      enableTwoFactorToggleAlt: 'input[name="enable2FA"]',
      
      sessionTimeoutInput: '[data-testid="session-timeout"]',
      sessionTimeoutInputAlt: 'input[name="sessionTimeout"]',
      
      // Buttons
      saveButton: '[data-testid="save-button"]',
      saveButtonAlt: 'button:has-text("Save")',
      
      cancelButton: '[data-testid="cancel-button"]',
      cancelButtonAlt: 'button:has-text("Cancel")',
      
      // Messages
      successMessage: '[data-testid="success-message"]',
      successMessageAlt: '.alert-success',
    };
  }

  /**
   * Navigate to Settings page
   */
  async goto() {
    await this.navigate('/admin/settings');
    await this.waitForPageLoad();
  }

  /**
   * Click General tab
   */
  async clickGeneralTab() {
    const selectors = [
      this.selectors.generalTab,
      this.selectors.generalTabAlt
    ];

    for (const selector of selectors) {
      try {
        await this.clickElement(selector);
        await this.wait(500);
        return;
      } catch (error) {
        continue;
      }
    }
  }

  /**
   * Click Security tab
   */
  async clickSecurityTab() {
    const selectors = [
      this.selectors.securityTab,
      this.selectors.securityTabAlt
    ];

    for (const selector of selectors) {
      try {
        await this.clickElement(selector);
        await this.wait(500);
        return;
      } catch (error) {
        continue;
      }
    }
  }

  /**
   * Update site name
   */
  async updateSiteName(siteName) {
    const selectors = [
      this.selectors.siteNameInput,
      this.selectors.siteNameInputAlt
    ];

    for (const selector of selectors) {
      try {
        await this.clearInput(selector);
        await this.fillInput(selector, siteName);
        return;
      } catch (error) {
        continue;
      }
    }
  }

  /**
   * Save settings
   */
  async save() {
    const selectors = [
      this.selectors.saveButton,
      this.selectors.saveButtonAlt
    ];

    for (const selector of selectors) {
      try {
        await this.clickElement(selector);
        await this.wait(1000);
        return;
      } catch (error) {
        continue;
      }
    }
  }

  /**
   * Get success message
   */
  async getSuccessMessage() {
    const selectors = [
      this.selectors.successMessage,
      this.selectors.successMessageAlt
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
}

module.exports = { SettingsPage };