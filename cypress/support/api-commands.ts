/// <reference types="cypress" />

// ===============================================
// GENERIC API CRUD COMMANDS FOR BACKEND TESTING
// ===============================================

/**
 * Generic API Create (POST) command
 * @param endpoint - API endpoint
 * @param body - Request body
 * @param options - Additional request options
 */
Cypress.Commands.add('apiCreate', (endpoint: string, body?: any, options?: Partial<Cypress.RequestOptions>) => {
  const defaultOptions: Partial<Cypress.RequestOptions> = {
    method: 'POST',
    url: `${Cypress.env('apiUrl')}${endpoint}`,
    body,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    failOnStatusCode: false
  };

  return cy.request({ ...defaultOptions, ...options });
});

/**
 * Generic API Read (GET) command
 * @param endpoint - API endpoint
 * @param options - Additional request options
 */
Cypress.Commands.add('apiRead', (endpoint: string, options?: Partial<Cypress.RequestOptions>) => {
  const defaultOptions: Partial<Cypress.RequestOptions> = {
    method: 'GET',
    url: `${Cypress.env('apiUrl')}${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    failOnStatusCode: false
  };

  return cy.request({ ...defaultOptions, ...options });
});

/**
 * Generic API Update (PUT/PATCH) command
 * @param endpoint - API endpoint
 * @param body - Request body
 * @param options - Additional request options
 */
Cypress.Commands.add('apiUpdate', (endpoint: string, body?: any, options?: Partial<Cypress.RequestOptions>) => {
  const defaultOptions: Partial<Cypress.RequestOptions> = {
    method: 'PUT',
    url: `${Cypress.env('apiUrl')}${endpoint}`,
    body,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    failOnStatusCode: false
  };

  return cy.request({ ...defaultOptions, ...options });
});

/**
 * Generic API Delete (DELETE) command
 * @param endpoint - API endpoint
 * @param options - Additional request options
 */
Cypress.Commands.add('apiDelete', (endpoint: string, options?: Partial<Cypress.RequestOptions>) => {
  const defaultOptions: Partial<Cypress.RequestOptions> = {
    method: 'DELETE',
    url: `${Cypress.env('apiUrl')}${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    failOnStatusCode: false
  };

  return cy.request({ ...defaultOptions, ...options });
});

/**
 * Generic API List (GET with query params) command
 * @param endpoint - API endpoint
 * @param query - Query parameters
 * @param options - Additional request options
 */
Cypress.Commands.add('apiList', (endpoint: string, query?: Record<string, any>, options?: Partial<Cypress.RequestOptions>) => {
  const queryString = query ? '?' + new URLSearchParams(query).toString() : '';
  const defaultOptions: Partial<Cypress.RequestOptions> = {
    method: 'GET',
    url: `${Cypress.env('apiUrl')}${endpoint}${queryString}`,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    failOnStatusCode: false
  };

  return cy.request({ ...defaultOptions, ...options });
});

/**
 * Set authentication token for API requests
 * @param token - JWT or Bearer token
 */
Cypress.Commands.add('setAuthToken', (token: string) => {
  cy.window().then((win) => {
    win.localStorage.setItem('authToken', token);
    win.localStorage.setItem('token', token);
  });
});

/**
 * Generate test data using Faker
 * @param type - Type of data to generate
 */
Cypress.Commands.add('generateTestData', (type: string) => {
  return cy.then(() => {
    const { faker } = require('@faker-js/faker');
    
    const generators: Record<string, () => any> = {
      user: () => ({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
        birthDate: faker.date.birthdate().toISOString().split('T')[0]
      }),
      product: () => ({
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: parseFloat(faker.commerce.price()),
        category: faker.commerce.department(),
        sku: faker.string.alphanumeric(8).toUpperCase()
      }),
      company: () => ({
        name: faker.company.name(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        website: faker.internet.url(),
        address: faker.location.streetAddress()
      })
    };

    return generators[type] ? generators[type]() : {};
  });
});

/**
 * Cleanup test data after tests
 */
Cypress.Commands.add('cleanupTestData', () => {
  cy.window().then((win) => {
    // Clear localStorage
    win.localStorage.clear();
    win.sessionStorage.clear();
  });
  
  // Clear cookies
  cy.clearCookies();
  
  // You can add specific cleanup logic here
  // For example, calling a cleanup API endpoint
  // cy.apiDelete('/test-data/cleanup');
});

// ===============================================
// HELPER FUNCTIONS
// ===============================================

/**
 * Get authentication headers for API requests
 */
function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  
  // Try to get token from localStorage or environment
  cy.window().then((win) => {
    const token = win.localStorage.getItem('authToken') || 
                  win.localStorage.getItem('token') || 
                  Cypress.env('authToken');
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  });

  return headers;
}
