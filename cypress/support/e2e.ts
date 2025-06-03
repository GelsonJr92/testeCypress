// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
// ***********************************************************

// Import commands.js using ES2015 syntax:
// import './commands'; // Removido pois o arquivo commands.ts foi excluído (era para frontend)
import './api-commands';
import './TestRunner';
import '@cypress/grep';

// Tipo para as respostas de API
declare global {
  interface Window {
    apiResponses?: Array<{
      testTitle: string;
      method: string;
      url: string;
      status: number;
      response: any;
      timestamp: string;
    }>;
  }
}

// Configure global settings
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing on uncaught exceptions
  console.log('Uncaught exception:', err.message);
  return false;
});

// Global before hook
before(() => {
  cy.log('Starting test suite');
  // Inicializar array para armazenar respostas das APIs
  cy.window().then((win) => {
    // @ts-ignore
    win.apiResponses = [];
  });
});

// Global after hook
after(() => {
  cy.log('Test suite completed');
  
  // Salvar respostas de API capturadas
  cy.window().then((win) => {
    // @ts-ignore
    if (win.apiResponses && win.apiResponses.length > 0) {
      cy.writeFile('cypress/reports/api-responses.json', win.apiResponses);
      cy.log(`Salvos ${win.apiResponses.length} detalhes de chamadas de API`);
    }
  });
});

// Screenshot on failure
Cypress.on('fail', (error, runnable) => {
  const parentTitle = runnable.parent?.title || 'unknown';
  cy.screenshot(`FAILED-${parentTitle}-${runnable.title}`, {
    capture: 'fullPage'
  });
  throw error;
});