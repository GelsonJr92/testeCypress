/**
 * Base Page Object Class
 * Contains common functionality shared across all pages
 */
export class BasePage {
  protected url: string;

  constructor(url: string = '') {
    this.url = url;
  }

  /**
   * Visit the page
   * @param path - Optional path to append to base URL
   */
  visit(path: string = ''): void {
    const fullUrl = this.url + path;
    cy.visit(fullUrl);
    this.waitForPageLoad();
  }

  /**
   * Wait for page to fully load
   */
  waitForPageLoad(): void {
    cy.get('body').should('be.visible');
    cy.get('[data-cy="loading"], .loading, .spinner').should('not.exist');
  }

  /**
   * Get page title
   */
  getTitle(): Cypress.Chainable<string> {
    return cy.title();
  }

  /**
   * Check if page is loaded
   */
  isLoaded(): Cypress.Chainable<boolean> {
    return cy.get('body').then(($body) => {
      return $body.is(':visible');
    });
  }

  /**
   * Take screenshot with custom name
   * @param name - Screenshot name
   */
  takeScreenshot(name?: string): void {
    const screenshotName = name || `${this.constructor.name}-${Date.now()}`;
    cy.screenshot(screenshotName, { capture: 'fullPage' });
  }

  /**
   * Scroll to element
   * @param selector - Element selector
   */
  scrollToElement(selector: string): void {
    cy.get(selector).scrollIntoView();
  }

  /**
   * Wait for specific element to be visible
   * @param selector - Element selector
   * @param timeout - Optional timeout
   */
  waitForElement(selector: string, timeout: number = 10000): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(selector, { timeout }).should('be.visible');
  }

  /**
   * Check if element exists without failing
   * @param selector - Element selector
   */
  elementExists(selector: string): Cypress.Chainable<boolean> {
    return cy.get('body').then(($body) => {
      return $body.find(selector).length > 0;
    });
  }

  /**
   * Get current URL
   */
  getCurrentUrl(): Cypress.Chainable<string> {
    return cy.url();
  }

  /**
   * Reload page
   */
  reload(): void {
    cy.reload();
    this.waitForPageLoad();
  }

  /**
   * Go back in browser history
   */
  goBack(): void {
    cy.go('back');
    this.waitForPageLoad();
  }

  /**
   * Go forward in browser history
   */
  goForward(): void {
    cy.go('forward');
    this.waitForPageLoad();
  }

  /**
   * Clear all form inputs on the page
   */
  clearAllInputs(): void {
    cy.get('input, textarea, select').each(($el) => {
      if ($el.is('input') || $el.is('textarea')) {
        cy.wrap($el).clear();
      }
    });
  }

  /**
   * Check for JavaScript errors on the page
   */
  checkForJsErrors(): void {
    cy.window().then((win) => {
      assert.equal(win.console.error.length, 0, 'No JavaScript errors should occur');
    });
  }
}
