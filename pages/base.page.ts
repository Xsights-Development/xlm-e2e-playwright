import { Page, Locator } from '@playwright/test';

/**
 * BasePage - Base class for all Page Objects
 * Contains common methods and utilities used by all pages
 */
export class BasePage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Navigate to a URL
     * @param url - Relative or absolute URL
     */
    async goto(url: string): Promise<void> {
        await this.page.goto(url);
    }

    /**
     * Wait for page load to complete
     */
    async waitForPageLoad(): Promise<void> {
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Wait for DOM content loaded
     */
    async waitForDOMContentLoaded(): Promise<void> {
        await this.page.waitForLoadState('domcontentloaded');
    }

    /**
     * Get page title
     */
    async getPageTitle(): Promise<string> {
        return await this.page.title();
    }

    /**
     * Get current URL
     */
    async getCurrentUrl(): Promise<string> {
        return this.page.url();
    }

    /**
     * Take screenshot
     * @param name - Screenshot filename
     */
    async takeScreenshot(name: string): Promise<void> {
        await this.page.screenshot({
            path: `test-results/screenshots/${name}.png`,
            fullPage: true
        });
    }

    /**
     * Wait for element to be visible
     * @param locator - Playwright locator
     */
    async waitForVisible(locator: Locator): Promise<void> {
        await locator.waitFor({ state: 'visible' });
    }

    /**
     * Wait for element to be hidden
     * @param locator - Playwright locator
     */
    async waitForHidden(locator: Locator): Promise<void> {
        await locator.waitFor({ state: 'hidden' });
    }

    /**
     * Click element with wait
     * @param locator - Playwright locator
     */
    async click(locator: Locator): Promise<void> {
        await locator.waitFor({ state: 'visible' });
        await locator.click();
    }

    /**
     * Fill text into input field
     * @param locator - Playwright locator
     * @param text - Text to fill
     */
    async fill(locator: Locator, text: string): Promise<void> {
        await locator.waitFor({ state: 'visible' });
        await locator.fill(text);
    }

    /**
     * Type text into input field (slower, triggers keydown events)
     * @param locator - Playwright locator
     * @param text - Text to type
     */
    async type(locator: Locator, text: string, delay: number = 50): Promise<void> {
        await locator.waitFor({ state: 'visible' });
        await locator.type(text, { delay });
    }

    /**
     * Clear input field
     * @param locator - Playwright locator
     */
    async clear(locator: Locator): Promise<void> {
        await locator.clear();
    }

    /**
     * Get text content of element
     * @param locator - Playwright locator
     */
    async getText(locator: Locator): Promise<string> {
        await locator.waitFor({ state: 'visible' });
        return await locator.textContent() || '';
    }

    /**
     * Get input value
     * @param locator - Playwright locator
     */
    async getValue(locator: Locator): Promise<string> {
        return await locator.inputValue();
    }

    /**
     * Check if element is visible
     * @param locator - Playwright locator
     */
    async isVisible(locator: Locator): Promise<boolean> {
        try {
            await locator.waitFor({ state: 'visible', timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Check if element is enabled
     * @param locator - Playwright locator
     */
    async isEnabled(locator: Locator): Promise<boolean> {
        return await locator.isEnabled();
    }

    /**
     * Wait for a specific time (uses setTimeout to avoid deprecated waitForTimeout)
     * Prefer waiting for elements/URL when possible.
     * @param ms - Milliseconds to wait
     */
    async wait(ms: number): Promise<void> {
        await new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Scroll to element
     * @param locator - Playwright locator
     */
    async scrollToElement(locator: Locator): Promise<void> {
        await locator.scrollIntoViewIfNeeded();
    }

    /**
     * Highlight element for visual inspection (e.g. red border, background).
     * Use in tests when you want to see what is being asserted in headed mode or screenshots.
     * @param locator - Element to highlight
     * @param options - border, background, durationMs to show highlight
     */
    async highlight(
        locator: Locator,
        options?: { border?: string; background?: string; durationMs?: number },
    ): Promise<void> {
        const border = options?.border ?? '3px solid red';
        const background = options?.background ?? 'rgba(255, 255, 0, 0.2)';
        await locator.evaluate(
            (el, { b, bg }) => {
                (el as HTMLElement).style.setProperty('border', b, 'important');
                (el as HTMLElement).style.setProperty('background-color', bg, 'important');
                (el as HTMLElement).style.setProperty('box-shadow', '0 0 0 2px rgba(255,0,0,0.5)', 'important');
            },
            { b: border, bg: background },
        );
        const duration = options?.durationMs ?? 1500;
        if (duration > 0) await this.wait(duration);
    }

    /**
     * Select option from dropdown
     * @param locator - Playwright locator for select element
     * @param value - Value to select
     */
    async selectOption(locator: Locator, value: string): Promise<void> {
        await locator.selectOption(value);
    }

    /**
     * Upload file
     * @param locator - Playwright locator for file input
     * @param filePath - Path to file
     */
    async uploadFile(locator: Locator, filePath: string): Promise<void> {
        await locator.setInputFiles(filePath);
    }

    /**
     * Press keyboard key
     * @param key - Key to press (e.g., 'Enter', 'Escape')
     */
    async pressKey(key: string): Promise<void> {
        await this.page.keyboard.press(key);
    }

    /**
     * Reload page
     */
    async reload(): Promise<void> {
        await this.page.reload();
    }

    /**
     * Go back
     */
    async goBack(): Promise<void> {
        await this.page.goBack();
    }
}
