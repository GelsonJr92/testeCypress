// ***********************************************************
// This example support/component.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Component mounting functionality
// Uncomment and install appropriate package based on your framework:
// For React: npm install --save-dev @cypress/react
// For Vue: npm install --save-dev @cypress/vue
// For Angular: npm install --save-dev @cypress/angular

// import { mount } from '@cypress/react' // For React
// import { mount } from '@cypress/vue'   // For Vue
// import { mount } from '@cypress/angular' // For Angular

// Augment the Cypress namespace to include type definitions for
// your custom command.
declare global {
  namespace Cypress {
    interface Chainable {
      // mount: typeof mount // Uncomment when you add component mounting
    }
  }
}

// Cypress.Commands.add('mount', mount) // Uncomment when you add component mounting

// Example use:
// cy.mount(<MyComponent />)

// Global component test configuration
beforeEach(() => {
  // Reset viewport for component tests
  cy.viewport(1280, 720)
  
  // Clear localStorage and sessionStorage
  cy.clearLocalStorage()
  cy.clearCookies()
})

// Component test error handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false here prevents Cypress from failing the test
  // for unhandled exceptions that might occur in React components
  console.error('Component test uncaught exception:', err)
  return false
})
