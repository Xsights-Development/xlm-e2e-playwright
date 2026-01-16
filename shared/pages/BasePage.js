/**
 * Base Page Object for App
 * Methods common to all pages
 */
class BasePage {
  constructor(page) {
    this.page = page;
  }

  /**
   * Navigate to a URL
   */
  async navigate(url) {
    // If URL starts with '/', prepend base URL
    const fullURL = url.startsWith('/') ? `${this.baseURL}${url}` : url;
    await this.page.goto(fullURL);
    console.log(`   ✓ Navigated to: ${fullURL}`);
  }

  /**
   * Wait for page to load completely
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for DOM content to be loaded
   */
  async waitForDOMLoad() {
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Click element with retry
   */
  async clickElement(selector, options = {}) {
    await this.page.click(selector, { 
      timeout: 10000,
      ...options 
    });
  }

  /**
   * Fill input field
   */
  async fillInput(selector, value, options = {}) {
    await this.page.fill(selector, value, {
      timeout: 10000,
      ...options
    });
  }

  /**
   * Get text content
   */
  async getText(selector) {
    return await this.page.textContent(selector);
  }

  /**
   * Get inner text (visible text only)
   */
  async getInnerText(selector) {
    return await this.page.innerText(selector);
  }

  /**
   * Check if element is visible
   */
  async isVisible(selector, options = {}) {
    try {
      return await this.page.isVisible(selector, {
        timeout: 5000,
        ...options
      });
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if element is hidden
   */
  async isHidden(selector, options = {}) {
    return await this.page.isHidden(selector, options);
  }

  /**
   * Wait for selector to be visible
   */
  async waitForSelector(selector, options = {}) {
    await this.page.waitForSelector(selector, { 
      state: 'visible',
      timeout: 10000,
      ...options 
    });
  }

  /**
   * Wait for selector to be hidden
   */
  async waitForSelectorHidden(selector, options = {}) {
    await this.page.waitForSelector(selector, { 
      state: 'hidden',
      timeout: 10000,
      ...options 
    });
  }

  /**
   * Get attribute value
   */
  async getAttribute(selector, attribute) {
    return await this.page.getAttribute(selector, attribute);
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(name) {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    await this.page.screenshot({ 
      path: `screenshots/${name}-${timestamp}.png`,
      fullPage: true
    });
  }

  /**
   * Scroll to element
   */
  async scrollToElement(selector) {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
  }

  /**
   * Hover over element
   */
  async hover(selector) {
    await this.page.hover(selector);
  }

  /**
   * Select option from dropdown
   */
  async selectOption(selector, value) {
    await this.page.selectOption(selector, value);
  }

  /**
   * Check checkbox
   */
  async check(selector) {
    await this.page.check(selector);
  }

  /**
   * Uncheck checkbox
   */
  async uncheck(selector) {
    await this.page.uncheck(selector);
  }

  /**
   * Get current URL
   */
  async getCurrentURL() {
    return this.page.url();
  }

  /**
   * Get page title
   */
  async getTitle() {
    return await this.page.title();
  }

  /**
   * Press keyboard key
   */
  async pressKey(key) {
    await this.page.keyboard.press(key);
  }

  /**
   * Type text (slower than fill, mimics user typing)
   */
  async type(selector, text, options = {}) {
    await this.page.type(selector, text, {
      delay: 100,
      ...options
    });
  }

  /**
   * Wait for navigation
   */
  async waitForNavigation(options = {}) {
    await this.page.waitForNavigation({
      timeout: 30000,
      ...options
    });
  }

  /**
   * Reload page
   */
  async reload(options = {}) {
    await this.page.reload(options);
  }

  /**
   * Go back
   */
  async goBack(options = {}) {
    await this.page.goBack(options);
  }

  /**
   * Go forward
   */
  async goForward(options = {}) {
    await this.page.goForward(options);
  }

  /**
   * Wait for timeout
   */
  async wait(milliseconds) {
    await this.page.waitForTimeout(milliseconds);
  }

  /**
   * Get input value
   */
  async getInputValue(selector) {
    return await this.page.inputValue(selector);
  }

  /**
   * Clear input
   */
  async clearInput(selector) {
    await this.page.fill(selector, '');
  }

  /**
   * Double click
   */
  async doubleClick(selector) {
    await this.page.dblclick(selector);
  }

  /**
   * Right click
   */
  async rightClick(selector) {
    await this.page.click(selector, { button: 'right' });
  }

  /**
   * Check if element is enabled
   */
  async isEnabled(selector) {
    return await this.page.isEnabled(selector);
  }

  /**
   * Check if element is disabled
   */
  async isDisabled(selector) {
    return await this.page.isDisabled(selector);
  }

  /**
   * Count elements matching selector
   */
  async count(selector) {
    return await this.page.locator(selector).count();
  }

  /**
   * Get all text contents matching selector
   */
  async getAllTexts(selector) {
    return await this.page.locator(selector).allTextContents();
  }
}

module.exports = { BasePage };