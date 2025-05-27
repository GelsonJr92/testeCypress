/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    // Comandos API CRUD (adaptados)
    loginApiServeRest(email?: string, password?: string): Chainable<Cypress.Response<any>> // Novo comando de login
    apiCreate(endpoint: string, body?: any, options?: Partial<Cypress.RequestOptions>): Chainable<Cypress.Response<any>>
    apiRead(endpoint: string, options?: Partial<Cypress.RequestOptions>): Chainable<Cypress.Response<any>>
    apiUpdate(endpoint: string, body?: any, options?: Partial<Cypress.RequestOptions>): Chainable<Cypress.Response<any>>
    apiDelete(endpoint: string, options?: Partial<Cypress.RequestOptions>): Chainable<Cypress.Response<any>>
    apiList(endpoint: string, query?: Record<string, any>, options?: Partial<Cypress.RequestOptions>): Chainable<Cypress.Response<any>>
    
    // Comandos de Utilidade (adaptados)
    setAuthToken(token: string): Chainable<any> // O token agora é específico da ServeRest
    cleanupTestData(): Chainable<any> // Adaptado para limpar o token da ServeRest
  }
}
