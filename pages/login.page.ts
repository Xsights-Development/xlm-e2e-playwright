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

        // Tenant and Farm selection: prefer data-testid, fallback to combobox (open dropdown first, then select by data-*-identifier)
        this.tenantCombobox = page.getByTestId("tenant-select").or(page.getByRole("combobox").first());
        this.farmCombobox = page.getByTestId("farm-select").or(page.getByRole("combobox").first());
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
     * Select tenant from dropdown by identifier (i18n-safe).
     * Must click combobox first to open dropdown, then click option [data-tenant-identifier].
     */
    async selectTenant(tenantIdentifier: string): Promise<void> {
        await this.tenantCombobox.waitFor({ state: 'visible', timeout: 10000 });
        await this.tenantCombobox.click();
        await this.wait(500);
        const option = this.page.locator(`[data-tenant-identifier="${tenantIdentifier}"]`).first();
        await option.waitFor({ state: 'visible', timeout: 10000 });
        await option.click();
        await this.wait(300);
    }

    /**
     * Select farm from dropdown by identifier (i18n-safe). Skips if not found.
     * Must click combobox first to open dropdown, then click option [data-farm-identifier].
     * App renders data-farm-identifier as String(farm.identifier) (may be number from API).
     */
    async selectFarm(farmIdentifier: string | number): Promise<void> {
        try {
            await this.farmCombobox.waitFor({ state: 'visible', timeout: 10000 });
            await this.farmCombobox.click();
            await this.wait(600);
            const id = String(farmIdentifier);
            const option = this.page.locator(`[data-farm-identifier="${id}"]`).first();
            await option.waitFor({ state: 'visible', timeout: 10000 });
            await option.click();
        } catch (error) {
            // Skip if option not found (e.g. identifier mismatch or dropdown closed)
        }
    }

    /**
     * Click Next button after tenant selection.
     * Waits for button to be enabled (form sets tenantIdentifier after option click).
     */
    async clickNext(): Promise<void> {
        await this.nextButton.waitFor({ state: 'visible', timeout: 10000 });
        await expect(this.nextButton).toBeEnabled({ timeout: 10000 });
        await this.nextButton.click();
    }

    /**
     * Click Go to Dashboard button after farm selection
     */
    async clickDashboard(): Promise<void> {
        await this.click(this.dashboardButton);
        await this.wait(1000);
    }

    /**
     * Wait for dashboard to load after login.
     * Polls URL so SPA client-side navigation (history.pushState) is detected.
     */
    async waitForDashboardLoad(): Promise<void> {
        const dashboardRegex = new RegExp(ROUTES.dashboard.replace(/\//g, '\\/'));
        const deadline = Date.now() + 30000;
        while (Date.now() < deadline) {
            if (dashboardRegex.test(this.page.url())) return;
            await this.wait(500);
        }
        throw new Error(
            `Dashboard did not load within 30s. Current URL: ${this.page.url()}`,
        );
    }

    /**
     * Check if we are on dashboard URL.
     */
    private isOnDashboard(): boolean {
        return new RegExp(ROUTES.dashboard.replace(/\//g, '\\/')).test(this.page.url());
    }

    /**
     * Wait for post-login screen: either dashboard or tenant selection.
     * After login the app switches to tenant screen immediately; we wait for it to be ready.
     */
    private async waitForPostLoginScreen(): Promise<void> {
        const deadline = Date.now() + 15000;
        while (Date.now() < deadline) {
            if (this.isOnDashboard()) return;
            if (await this.tenantCombobox.isVisible({ timeout: 1000 }).catch(() => false)) return;
            if (await this.page.getByTestId("farm-select").isVisible({ timeout: 500 }).catch(() => false)) return;
            await this.wait(300);
        }
    }

    /**
     * Adaptive post-login: if app shows tenant selector, select by identifier and Next;
     * if app shows farm selector, select by identifier and Go to Dashboard.
     * If user has 1 tenant + 1 farm, app skips both and redirects to dashboard (no action needed).
     */
    async ensureDashboardAfterLogin(
        tenantIdentifier: string,
        farmIdentifier: string | number,
    ): Promise<void> {
        await this.waitForPostLoginScreen();

        if (this.isOnDashboard()) return;

        if (await this.tenantCombobox.isVisible({ timeout: 1000 }).catch(() => false)) {
            await this.selectTenant(tenantIdentifier);
            await this.wait(1500);
            await this.clickNext();
        }

        if (this.isOnDashboard()) return;

        
        // Only run farm step when farm selector is actually shown (farm-select). Do not use farmCombobox
        // here because .or(combobox.first()) can match the tenant combobox still in DOM when 1 farm.
        const farmStepVisible = await this.page.getByTestId("farm-select").isVisible({ timeout: 3000 }).catch(() => false);
        if (farmStepVisible) {
            await this.selectFarm(farmIdentifier);
            await this.clickDashboard();
            await this.wait(2000);
        }

        await this.waitForDashboardLoad();
    }

    // ==================== COMPLETE FLOW ====================

    /**
     * Complete full authentication flow: login then reach dashboard.
     * If user has 1 tenant + 1 farm, app skips tenant/farm selection and goes straight to dashboard.
     * Otherwise selects tenant (and optionally farm) by identifier.
     *
     * @param email - User email
     * @param password - User password
     * @param tenantIdentifier - Tenant identifier to select (when tenant step is shown)
     * @param farmIdentifier - Farm identifier to select (when farm step is shown)
     */
    async loginWithTenantAndFarm(
        email: string,
        password: string,
        tenantIdentifier: string,
        farmIdentifier: string | number,
    ): Promise<void> {
        await this.login(email, password);
        await this.ensureDashboardAfterLogin(tenantIdentifier, farmIdentifier);
    }
}
