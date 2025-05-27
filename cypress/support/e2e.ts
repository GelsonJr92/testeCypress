// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';
import './api-commands';
import 'cypress-real-events';
import '@cypress/grep';

// Configure global settings
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing on uncaught exceptions
  console.log('Uncaught exception:', err.message);
  return false;
});

// Global before hook
before(() => {
  cy.log('🚀 Starting test suite');
});

// Global after hook
after(() => {
  cy.log('✅ Test suite completed');
});

// Screenshot on failure
Cypress.on('fail', (error, runnable) => {
  const parentTitle = runnable.parent?.title || 'unknown';
  cy.screenshot(`FAILED-${parentTitle}-${runnable.title}`, {
    capture: 'fullPage'
  });
  throw error;
});