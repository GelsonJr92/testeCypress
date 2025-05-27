/// <reference types="cypress" />

// ===============================================
// COMANDOS GENÉRICOS DE API CRUD PARA TESTES BACKEND
// ADAPTADOS PARA SERVEREST
// ===============================================

/**
 * Comando de Login para a API ServeRest
 * @param email - Email do usuário (padrão: fulano@qa.com)
 * @param password - Senha do usuário (padrão: teste)
 */
Cypress.Commands.add('loginApiServeRest', (email?: string, password?: string) => {
  const userEmail = email || 'fulano@qa.com';
  const userPassword = password || 'teste';

  return cy.request({
    method: 'POST',
    url: '/login',
    body: {
      email: userEmail,
      password: userPassword
    },
    failOnStatusCode: false
  }).then((response) => {
    if (response.status === 200 && response.body.authorization) {
      console.log('Login API bem-sucedido! Token obtido.');
      return response.body.authorization; // Retorna apenas o token
    } else {
      console.error('Falha no Login API', response);
      throw new Error(`Falha no login: ${response.status} - ${JSON.stringify(response.body)}`);
    }
  });
});

/**
 * Comando genérico de Criação (POST) via API
 * @param endpoint - Endpoint da API (ex: /usuarios)
 * @param body - Corpo da requisição
 * @param options - Opções adicionais da requisição
 */
Cypress.Commands.add('apiCreate', (endpoint: string, body?: any, options?: Partial<Cypress.RequestOptions>) => {
  return cy.window().then((window) => {
    const token = window.localStorage.getItem('token');
    console.log('🔍 apiCreate - Token encontrado:', token ? 'SIM' : 'NÃO');
    console.log('🔍 apiCreate - Token completo:', token);
    
    const headers: any = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = token;
      console.log('✅ Token adicionado ao header Authorization');
    } else {
      console.warn('⚠️ Nenhum token encontrado no localStorage');
    }

    const defaultOptions: Partial<Cypress.RequestOptions> = {
      method: 'POST',
      url: `${Cypress.env('apiUrl')}${endpoint}`,
      body,
      headers,
      failOnStatusCode: false
    };
    
    console.log('🚀 Enviando requisição:', {
      method: defaultOptions.method,
      url: defaultOptions.url,
      headers: defaultOptions.headers,
      body: defaultOptions.body
    });
    
    return cy.request({ ...defaultOptions, ...options });
  });
});

/**
 * Comando genérico de Leitura (GET) via API
 * @param endpoint - Endpoint da API (ex: /usuarios/{id})
 * @param options - Opções adicionais da requisição
 */
Cypress.Commands.add('apiRead', (endpoint: string, options?: Partial<Cypress.RequestOptions>) => {
  return cy.window().then((window) => {
    const token = window.localStorage.getItem('token');
    const headers: any = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = token;
    }

    const defaultOptions: Partial<Cypress.RequestOptions> = {
      method: 'GET',
      url: `${Cypress.env('apiUrl')}${endpoint}`,
      headers,
      failOnStatusCode: false
    };
    
    return cy.request({ ...defaultOptions, ...options });
  });
});

/**
 * Comando genérico de Atualização (PUT/PATCH) via API
 * @param endpoint - Endpoint da API (ex: /usuarios/{id})
 * @param body - Corpo da requisição
 * @param options - Opções adicionais da requisição
 */
Cypress.Commands.add('apiUpdate', (endpoint: string, body?: any, options?: Partial<Cypress.RequestOptions>) => {
  return cy.window().then((window) => {
    const token = window.localStorage.getItem('token');
    const headers: any = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = token;
    }

    const defaultOptions: Partial<Cypress.RequestOptions> = {
      method: 'PUT',
      url: `${Cypress.env('apiUrl')}${endpoint}`,
      body,
      headers,
      failOnStatusCode: false
    };
    
    return cy.request({ ...defaultOptions, ...options });
  });
});

/**
 * Comando genérico de Exclusão (DELETE) via API
 * @param endpoint - Endpoint da API (ex: /usuarios/{id})
 * @param options - Opções adicionais da requisição
 */
Cypress.Commands.add('apiDelete', (endpoint: string, options?: Partial<Cypress.RequestOptions>) => {
  return cy.window().then((window) => {
    const token = window.localStorage.getItem('token');
    const headers: any = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = token;
    }

    const defaultOptions: Partial<Cypress.RequestOptions> = {
      method: 'DELETE',
      url: `${Cypress.env('apiUrl')}${endpoint}`,
      headers,
      failOnStatusCode: false
    };
    
    return cy.request({ ...defaultOptions, ...options });
  });
});

/**
 * Comando genérico de Listagem (GET com query params) via API
 * @param endpoint - Endpoint da API (ex: /usuarios)
 * @param query - Parâmetros de query
 * @param options - Opções adicionais da requisição
 */
Cypress.Commands.add('apiList', (endpoint: string, query?: Record<string, any>, options?: Partial<Cypress.RequestOptions>) => {
  return cy.window().then((window) => {
    const token = window.localStorage.getItem('token');
    const headers: any = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = token;
    }    const queryString = query ? '?' + new URLSearchParams(query).toString() : '';
    const defaultOptions: Partial<Cypress.RequestOptions> = {
      method: 'GET',
      url: `${Cypress.env('apiUrl')}${endpoint}${queryString}`,
      headers,
      failOnStatusCode: false
    };
    
    return cy.request({ ...defaultOptions, ...options });
  });
});

/**
 * Define o token de autenticação para requisições API (específico para ServeRest agora)
 * @param token - Token JWT (geralmente obtido do /login)
 */
Cypress.Commands.add('setAuthToken', (token: string) => {
  cy.window().then((win) => {
    win.localStorage.setItem('token', token);
  });
});

/**
 * Limpa dados de teste após os testes (adaptado)
 */
Cypress.Commands.add('cleanupTestData', () => {
  cy.window().then((win) => {
    win.localStorage.removeItem('token');
  });
  cy.clearCookies();
});
