import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '@/pages/base.page.js';
import { ROUTES } from '@/configs/routes.js';

/**
 * DashboardPage - Page Object for Dashboard page
 * Aligned with xahwm-docs/06-selectors.md (tags-deployed-panel, tags-deployed-title)
 */
export class DashboardPage extends BasePage {
    // Primary locators from xahwm-dashboard (data-testid) - use for stable assertions
    readonly tagsDeployedPanel: Locator;
    readonly tagsDeployedTitle: Locator;

    // Locators for welcome/header elements (fallback)
    readonly welcomeMessage: Locator;
    readonly pageTitle: Locator;

    // Locators for user info
    readonly userMenu: Locator;
    readonly userName: Locator;
    readonly userAvatar: Locator;

    // Locators for navigation
    readonly navigationMenu: Locator;

    // Locators for logout
    readonly logoutButton: Locator;

    // Locators for dashboard widgets/cards
    readonly statsCard: Locator;

    // Locators for notifications
    readonly notificationBell: Locator;
    readonly notificationBadge: Locator;

    constructor(page: Page) {
        super(page);

        // Primary: xahwm-dashboard data-testid (see xahwm-docs/06-selectors.md)
        this.tagsDeployedPanel = page.getByTestId('tags-deployed-panel');
        this.tagsDeployedTitle = page.getByTestId('tags-deployed-title');

        // Fallback locators
        this.welcomeMessage = page.locator('[data-testid="welcome-message"], .welcome, .greeting').first();
        this.pageTitle = page.locator('[data-testid="page-title"], h1').first();

        this.userMenu = page.locator('[data-testid="user-menu"], .user-menu, [aria-label="User menu"]').first();
        this.userName = page.locator('[data-testid="user-name"], .user-name').first();
        this.userAvatar = page.locator('[data-testid="user-avatar"], .avatar').first();

        this.navigationMenu = page.locator('[data-testid="navigation"], nav, .nav-menu').first();

        this.logoutButton = page.locator('[data-testid="logout-button"], button:has-text("Logout"), button:has-text("Log out")').first();

        this.statsCard = page.locator('[data-testid="stats-card"], .stats-card');

        this.notificationBell = page.locator('[data-testid="notification-bell"], .notification-icon').first();
        this.notificationBadge = page.locator('[data-testid="notification-badge"], .badge').first();
    }

    /**
     * Navigate to dashboard
     */
    async navigateToDashboard(): Promise<void> {
        await this.goto(ROUTES.dashboard);
        await this.waitForPageLoad();
    }

    /**
     * Get welcome message text
     */
    async getWelcomeMessage(): Promise<string> {
        try {
            return await this.getText(this.welcomeMessage);
        } catch (error) {
            return '';
        }
    }

    /**
     * Get page title text
     */
    async getPageTitle(): Promise<string> {
        try {
            return await this.getText(this.pageTitle);
        } catch (error) {
            return '';
        }
    }

    /**
     * Get user name text
     */
    async getUserName(): Promise<string> {
        try {
            return await this.getText(this.userName);
        } catch (error) {
            return '';
        }
    }

    /**
     * Open user menu by clicking on it or user avatar
     */
    async openUserMenu(): Promise<void> {
        try {
            // Try clicking user menu first
            if (await this.userMenu.isVisible({ timeout: 2000 })) {
                await this.click(this.userMenu);
                return;
            }
        } catch (error) {
            // If user menu not found, try clicking avatar
            await this.click(this.userAvatar);
        }
    }

    /**
     * Logout from the application
     */
    async logout(): Promise<void> {
        await this.openUserMenu();
        // Wait for logout button to be visible (avoids deprecated waitForTimeout)
        await this.logoutButton.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});

        await this.click(this.logoutButton);
    }

    /**
     * Check if welcome message is visible
     */
    async isWelcomeMessageVisible(): Promise<boolean> {
        try {
            return await this.welcomeMessage.isVisible({ timeout: 5000 });
        } catch (error) {
            return false;
        }
    }

    /**
     * Check if navigation menu is visible
     */
    async isNavigationVisible(): Promise<boolean> {
        try {
            return await this.navigationMenu.isVisible({ timeout: 5000 });
        } catch (error) {
            return false;
        }
    }

    /**
     * Get sidebar nav link that points to the given path (href).
     * Use for menu navigation tests (i18n-safe; does not rely on label text).
     */
    getNavLinkByPath(path: string): Locator {
        return this.navigationMenu.locator(`a[href="${path}"]`).first();
    }

    /**
     * Click the sidebar nav link for the given path and wait for navigation.
     */
    async clickNavTo(path: string): Promise<void> {
        const link = this.getNavLinkByPath(path);
        await link.waitFor({ state: 'visible', timeout: 10000 });
        await link.click();
        await this.page.waitForURL(new RegExp(path.replace(/\//g, '\\/')), { timeout: 15000 });
    }

    /**
     * Get notification count from badge
     */
    async getNotificationCount(): Promise<number> {
        try {
            const text = await this.getText(this.notificationBadge);
            return parseInt(text) || 0;
        } catch (error) {
            return 0;
        }
    }

    /**
     * Click notification bell
     */
    async clickNotificationBell(): Promise<void> {
        await this.click(this.notificationBell);
    }

    /**
     * Count stats cards on dashboard
     */
    async getStatsCardCount(): Promise<number> {
        try {
            return await this.statsCard.count();
        } catch (error) {
            return 0;
        }
    }

    /**
     * Verify dashboard page is loaded (primary: xahwm-docs selectors)
     */
    async verifyDashboardLoaded(): Promise<void> {
        const currentUrl = await this.getCurrentUrl();
        expect(currentUrl).toContain(ROUTES.dashboard);

        // Primary assertion: tags-deployed panel from xahwm-dashboard (see xahwm-docs/06-selectors.md)
        await expect(this.tagsDeployedPanel).toBeVisible({ timeout: 10000 });

        // Optional: title visible when present
        const hasTitle = await this.tagsDeployedTitle.isVisible().catch(() => false);
        if (hasTitle) {
            await expect(this.tagsDeployedTitle).toBeVisible();
        }
    }

    /**
     * Check if tags-deployed panel is visible (for smoke checks)
     */
    async isTagsDeployedPanelVisible(): Promise<boolean> {
        try {
            return await this.tagsDeployedPanel.isVisible({ timeout: 5000 });
        } catch {
            return false;
        }
    }
}
