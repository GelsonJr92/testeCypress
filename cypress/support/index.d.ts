/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    // Frontend CRUD Commands
    fillForm(selector: string, data: Record<string, any>): Chainable<any>
    verifyTableRow(data: Record<string, any>): Chainable<any>
    performTableAction(rowIdentifier: string, action: 'edit' | 'delete' | 'view'): Chainable<any>
    waitForLoading(): Chainable<any>
    handleModal(action: 'confirm' | 'cancel'): Chainable<any>
    searchTable(searchTerm: string): Chainable<any>
    goToPage(page: number): Chainable<any>
    verifyNotification(message: string, type?: 'success' | 'error' | 'warning' | 'info'): Chainable<any>
    
    // API CRUD Commands
    apiCreate(endpoint: string, body?: any, options?: Partial<Cypress.RequestOptions>): Chainable<Cypress.Response<any>>
    apiRead(endpoint: string, options?: Partial<Cypress.RequestOptions>): Chainable<Cypress.Response<any>>
    apiUpdate(endpoint: string, body?: any, options?: Partial<Cypress.RequestOptions>): Chainable<Cypress.Response<any>>
    apiDelete(endpoint: string, options?: Partial<Cypress.RequestOptions>): Chainable<Cypress.Response<any>>
    apiList(endpoint: string, query?: Record<string, any>, options?: Partial<Cypress.RequestOptions>): Chainable<Cypress.Response<any>>
    
    // Utility Commands
    setAuthToken(token: string): Chainable<any>
    generateTestData(type: string): Chainable<any>
    cleanupTestData(): Chainable<any>
  }
}
