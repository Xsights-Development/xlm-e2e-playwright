import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from '@/pages/base.page.js';
import { ROUTES } from '@/configs/routes.js';

/**
 * LoginPage - Page Object for Login page
 * Handles login flow: email/password → tenant selection → farm selection → dashboard
 */
export class LoginPage extends BasePage {
    // Login form locators
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;
    readonly errorMessage: Locator;

    // Tenant and Farm selection locators
    readonly tenantCombobox: Locator;
    readonly farmCombobox: Locator;
    readonly nextButton: Locator;
    readonly dashboardButton: Locator;

    constructor(page: Page) {
        super(page);

        // Initialize login form locators using data-testid (language-independent)
        this.emailInput = page.getByTestId("email-input");
        this.passwordInput = page.getByTestId("password-input");
        this.loginButton = page.getByTestId("login-button");
        this.errorMessage = page.locator('[role="alert"]').first();

        // Tenant and Farm selection
        this.tenantCombobox = page.getByRole("combobox").first();
        this.farmCombobox = page.getByRole("combobox").nth(1);
        this.nextButton = page.getByTestId("next-button");
        this.dashboardButton = page.getByTestId("dashboard-button");
    }

    /**
     * Navigate to login page
     */
    async navigateToLoginPage(): Promise<void> {
        await this.goto(ROUTES.signIn);
        await this.waitForPageLoad();
    }

    /**
     * Perform login with credentials
     * @param email - Email address
     * @param password - Password
     */
    async login(email: string, password: string): Promise<void> {
        await this.fill(this.emailInput, email);
        await this.fill(this.passwordInput, password);
        await this.click(this.loginButton);
        // Wait a bit for response
        await this.wait(1000);
    }

    /**
     * Fill only email field
     */
    async fillEmail(email: string): Promise<void> {
        await this.fill(this.emailInput, email);
    }

    /**
     * Fill only password field
     */
    async fillPassword(password: string): Promise<void> {
        await this.fill(this.passwordInput, password);
    }

    /**
     * Click login button
     */
    async clickLogin(): Promise<void> {
        await this.click(this.loginButton);
    }

    /**
     * Get error message text
     */
    async getErrorMessage(): Promise<string> {
        return await this.getText(this.errorMessage);
    }

    /**
     * Check if error message is visible
     */
    async isErrorVisible(): Promise<boolean> {
        try {
            return await this.errorMessage.isVisible({ timeout: 5000 });
        } catch (error) {
            return false;
        }
    }

    /**
     * Verify login page is loaded
     */
    async verifyLoginPageLoaded(): Promise<void> {
        await expect(this.emailInput).toBeVisible();
        await expect(this.passwordInput).toBeVisible();
        await expect(this.loginButton).toBeVisible();
    }

    // ==================== TENANT AND FARM SELECTION ====================

    /**
     * Select tenant from dropdown
     * @param tenant - Tenant name to select
     */
    async selectTenant(tenant: string): Promise<void> {
        await this.tenantCombobox.click();
        await this.page.getByText(tenant, { exact: true }).click();
    }

    /**
     * Select farm from dropdown (skip if not found)
     * @param farm - Farm name to select
     */
    async selectFarm(farm: string): Promise<void> {
        try {
            await this.farmCombobox.click();
            await this.page.getByText(farm, { exact: true }).click();
        } catch (error) {}
		// console.log(`   ⚠ Skip selection "${farm}" ⚠️`);
    }

    /**
     * Click Next button after tenant selection
     */
    async clickNext(): Promise<void> {
        await this.click(this.nextButton);
    }

    /**
     * Click Go to Dashboard button after farm selection
     */
    async clickDashboard(): Promise<void> {
        await this.click(this.dashboardButton);
        await this.wait(1000);
    }

    /**
     * Wait for dashboard to load after login
     */
    async waitForDashboardLoad(): Promise<void> {
        await this.page.waitForURL(new RegExp(ROUTES.dashboard.replace(/\//g, '\\/')), { timeout: 15000 });
    }

    // ==================== COMPLETE FLOW ====================

    /**
     * Complete full authentication flow: login → tenant → farm → dashboard
     * @param email - User email
     * @param password - User password
     * @param tenant - Tenant name
     * @param farm - Farm name
     */
    async loginWithTenantAndFarm(
        email: string,
        password: string,
        tenant: string,
        farm: string,
    ): Promise<void> {
        // Step 1: Login with credentials
        await this.login(email, password);
        await this.wait(1000);

        // Step 2: Select tenant and click Next
        await this.selectTenant(tenant);
        await this.clickNext();
        await this.wait(1000);

        // Step 3: Select farm and go to dashboard
        await this.selectFarm(farm);
        await this.clickDashboard();
    }
}
