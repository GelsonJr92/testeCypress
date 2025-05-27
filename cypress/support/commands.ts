/// <reference types="cypress" />

// ===============================================
// GENERIC CRUD COMMANDS FOR FRONTEND TESTING
// ===============================================

/**
 * Generic form filling command
 * @param selector - The form selector
 * @param data - Object with form data
 */
Cypress.Commands.add('fillForm', (selector: string, data: Record<string, any>) => {
  cy.get(selector).within(() => {
    Object.keys(data).forEach(field => {
      const value = data[field];
      if (value !== null && value !== undefined && value !== '') {
        cy.get(`[data-cy="${field}"], [name="${field}"], #${field}`)
          .clear()
          .type(value.toString());
      }
    });
  });
});

/**
 * Generic table row verification
 * @param data - Object with data to verify
 */
Cypress.Commands.add('verifyTableRow', (data: Record<string, any>) => {
  Object.values(data).forEach(value => {
    if (value !== null && value !== undefined && value !== '') {
      cy.contains(value.toString()).should('be.visible');
    }
  });
});

/**
 * Generic table action (edit, delete, view)
 * @param rowIdentifier - Unique identifier for the row
 * @param action - Action to perform
 */
Cypress.Commands.add('performTableAction', (rowIdentifier: string, action: 'edit' | 'delete' | 'view') => {
  cy.contains('tr', rowIdentifier)
    .find(`[data-cy="${action}"], .btn-${action}, .${action}-btn`)
    .click();
});

/**
 * Wait for loading to finish
 */
Cypress.Commands.add('waitForLoading', () => {
  cy.get('[data-cy="loading"], .loading, .spinner').should('not.exist');
  cy.get('body').should('not.have.class', 'loading');
});

/**
 * Generic modal handling
 * @param action - confirm or cancel
 */
Cypress.Commands.add('handleModal', (action: 'confirm' | 'cancel') => {
  cy.get('[data-cy="modal"], .modal').should('be.visible');
  cy.get(`[data-cy="${action}"], .btn-${action}, .${action}-btn`).click();
});

/**
 * Generic search functionality
 * @param searchTerm - Term to search for
 */
Cypress.Commands.add('searchTable', (searchTerm: string) => {
  cy.get('[data-cy="search"], [placeholder*="search"], [placeholder*="Search"]')
    .clear()
    .type(searchTerm);
  // Wait for search results
  cy.wait(500);
});

/**
 * Generic pagination
 * @param page - Page number to navigate to
 */
Cypress.Commands.add('goToPage', (page: number) => {
  cy.get(`[data-cy="page-${page}"], .page-${page}, [aria-label="Page ${page}"]`).click();
  // Wait for page load
  cy.wait(500);
});

/**
 * Generic toast/notification verification
 * @param message - Expected message
 * @param type - success, error, warning, info
 */
Cypress.Commands.add('verifyNotification', (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
  cy.get(`[data-cy="toast"], .toast, .notification, .alert-${type}`)
    .should('be.visible')
    .and('contain', message);
});