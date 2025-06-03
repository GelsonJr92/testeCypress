/// <reference types="cypress" />

// Definições TypeScript para credenciais dinâmicas
interface DynamicCredentials {
  nome: string;
  email: string;
  password: string;
  administrador: string;
}

declare namespace Cypress {  interface Chainable {
    // Comandos API CRUD (adaptados para ServeRest)
    loginApiServeRest(type?: 'admin' | 'user'): Chainable<Element>
    apiCreate(endpoint: string, body?: any, options?: Partial<Cypress.RequestOptions>): Chainable<Cypress.Response<any>>
    apiRead(endpoint: string, options?: Partial<Cypress.RequestOptions>): Chainable<Cypress.Response<any>>
    apiUpdate(endpoint: string, body?: any, options?: Partial<Cypress.RequestOptions>): Chainable<Cypress.Response<any>>
    apiDelete(endpoint: string, options?: Partial<Cypress.RequestOptions>): Chainable<Cypress.Response<any>>
    apiList(endpoint: string, query?: Record<string, any>, options?: Partial<Cypress.RequestOptions>): Chainable<Cypress.Response<any>>
  }
}
