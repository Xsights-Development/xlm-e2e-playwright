const { BasePage } = require('./BasePage');

/**
 * Dashboard Page Object cho App
 */
class DashboardPage extends BasePage {
  constructor(page) {
    super(page);
    
    this.selectors = {
      // Welcome/Header
      welcomeMessage: '[data-testid="welcome-message"]',
      welcomeMessageAlt: '.welcome',
      welcomeMessageAlt2: '.greeting',
      
      pageTitle: '[data-testid="page-title"]',
      pageTitleAlt: 'h1',
      
      // User info
      userMenu: '[data-testid="user-menu"]',
      userMenuAlt: '.user-menu',
      userMenuAlt2: '[aria-label="User menu"]',
      
      userName: '[data-testid="user-name"]',
      userNameAlt: '.user-name',
      
      userAvatar: '[data-testid="user-avatar"]',
      userAvatarAlt: '.avatar',
      
      // Navigation
      navigationMenu: '[data-testid="navigation"]',
      navigationMenuAlt: 'nav',
      navigationMenuAlt2: '.nav-menu',
      
      // Logout
      logoutButton: '[data-testid="logout-button"]',
      logoutButtonAlt: 'button:has-text("Logout")',
      logoutButtonAlt2: 'button:has-text("Đăng xuất")',
      
      // Dashboard widgets/cards
      statsCard: '[data-testid="stats-card"]',
      statsCardAlt: '.stats-card',
      
      // Notifications
      notificationBell: '[data-testid="notification-bell"]',
      notificationBellAlt: '.notification-icon',
      
      notificationBadge: '[data-testid="notification-badge"]',
      notificationBadgeAlt: '.badge',
    };
  }

  /**
   * Navigate to dashboard
   */
  async goto() {
    await this.navigate('/dashboard');
    await this.waitForPageLoad();
  }

  /**
   * Get welcome message
   */
  async getWelcomeMessage() {
    const selectors = [
      this.selectors.welcomeMessage,
      this.selectors.welcomeMessageAlt,
      this.selectors.welcomeMessageAlt2
    ];

    for (const selector of selectors) {
      try {
        return await this.getText(selector);
      } catch (error) {
        continue;
      }
    }
    
    return '';
  }

  /**
   * Get page title
   */
  async getPageTitle() {
    const selectors = [
      this.selectors.pageTitle,
      this.selectors.pageTitleAlt
    ];

    for (const selector of selectors) {
      try {
        return await this.getText(selector);
      } catch (error) {
        continue;
      }
    }
    
    return '';
  }

  /**
   * Get user name
   */
  async getUserName() {
    const selectors = [
      this.selectors.userName,
      this.selectors.userNameAlt
    ];

    for (const selector of selectors) {
      try {
        return await this.getText(selector);
      } catch (error) {
        continue;
      }
    }
    
    return '';
  }

  /**
   * Open user menu
   */
  async openUserMenu() {
    const selectors = [
      this.selectors.userMenu,
      this.selectors.userMenuAlt,
      this.selectors.userMenuAlt2,
      this.selectors.userAvatar,
      this.selectors.userAvatarAlt
    ];

    for (const selector of selectors) {
      try {
        await this.clickElement(selector);
        console.log(`✓ User menu opened using: ${selector}`);
        return;
      } catch (error) {
        continue;
      }
    }
    
    throw new Error('Could not find user menu');
  }

  /**
   * Logout
   */
  async logout() {
    await this.openUserMenu();
    await this.wait(500); // Wait for menu animation
    
    const selectors = [
      this.selectors.logoutButton,
      this.selectors.logoutButtonAlt,
      this.selectors.logoutButtonAlt2
    ];

    for (const selector of selectors) {
      try {
        await this.clickElement(selector);
        console.log(`✓ Logout clicked using: ${selector}`);
        return;
      } catch (error) {
        continue;
      }
    }
    
    throw new Error('Could not find logout button');
  }

  /**
   * Check if welcome message is visible
   */
  async isWelcomeMessageVisible() {
    const selectors = [
      this.selectors.welcomeMessage,
      this.selectors.welcomeMessageAlt,
      this.selectors.welcomeMessageAlt2
    ];

    for (const selector of selectors) {
      const isVisible = await this.isVisible(selector);
      if (isVisible) return true;
    }
    
    return false;
  }

  /**
   * Check if navigation is visible
   */
  async isNavigationVisible() {
    const selectors = [
      this.selectors.navigationMenu,
      this.selectors.navigationMenuAlt,
      this.selectors.navigationMenuAlt2
    ];

    for (const selector of selectors) {
      const isVisible = await this.isVisible(selector);
      if (isVisible) return true;
    }
    
    return false;
  }

  /**
   * Get notification count
   */
  async getNotificationCount() {
    const selectors = [
      this.selectors.notificationBadge,
      this.selectors.notificationBadgeAlt
    ];

    for (const selector of selectors) {
      try {
        const text = await this.getText(selector);
        return parseInt(text) || 0;
      } catch (error) {
        continue;
      }
    }
    
    return 0;
  }

  /**
   * Click notification bell
   */
  async clickNotificationBell() {
    const selectors = [
      this.selectors.notificationBell,
      this.selectors.notificationBellAlt
    ];

    for (const selector of selectors) {
      try {
        await this.clickElement(selector);
        return;
      } catch (error) {
        continue;
      }
    }
  }

  /**
   * Count stats cards on dashboard
   */
  async getStatsCardCount() {
    const selectors = [
      this.selectors.statsCard,
      this.selectors.statsCardAlt
    ];

    for (const selector of selectors) {
      try {
        return await this.count(selector);
      } catch (error) {
        continue;
      }
    }
    
    return 0;
  }
}

module.exports = { DashboardPage };