/// <reference types="cypress" />

// ===============================================
// COMANDOS GENÉRICOS DE API CRUD PARA TESTES BACKEND
// ADAPTADOS PARA SERVEREST COM CREDENCIAIS DINÂMICAS
// ===============================================

/**
 * Comando de Login para a API ServeRest usando credenciais dinâmicas APENAS EM MEMÓRIA
 * @param type - Tipo de usuário ('admin' ou 'user', padrão: 'admin')
 */
Cypress.Commands.add('loginApiServeRest', (type: 'admin' | 'user' = 'admin') => {
  cy.log(`Iniciando login API ServeRest - tipo: ${type}`);
  
  // Primeiro tenta obter credenciais da memória
  const envKey = type === 'admin' ? 'DYNAMIC_ADMIN_CREDENTIALS' : 'DYNAMIC_USER_CREDENTIALS';
  let credentialsJson = Cypress.env(envKey);
  
  // Se não existir em memória, chamar a task para garantir credenciais
  if (!credentialsJson) {
    cy.log(`Inicializando credenciais dinâmicas para ${type}...`);
    cy.task('ensureDynamicCredentials', null, { timeout: 20000 }).then((sessionCredentials: any) => {
      if (sessionCredentials?.admin && sessionCredentials?.user) {
        // Armazenar em memória para próximas chamadas
        Cypress.env('DYNAMIC_ADMIN_CREDENTIALS', JSON.stringify(sessionCredentials.admin));
        Cypress.env('DYNAMIC_USER_CREDENTIALS', JSON.stringify(sessionCredentials.user));
        
        const credentials = type === 'admin' ? sessionCredentials.admin : sessionCredentials.user;
        cy.log(`Usando credenciais dinâmicas ${type}: ${credentials.email}`);

        cy.request({
          method: 'POST',
          url: '/login',
          body: {
            email: credentials.email,
            password: credentials.password
          },
          failOnStatusCode: false
        }).then((response) => {
          if (response.status === 200) {
            cy.log(`Login API ${type} bem-sucedido com credenciais dinâmicas! Token obtido.`);
            // Armazenar automaticamente no localStorage
            cy.window().then((window) => {
              window.localStorage.setItem('token', response.body.authorization);
              cy.log(`Token armazenado automaticamente no localStorage`);
            });
          } else {
            throw new Error(`Login ${type} falhou com status ${response.status}: ${JSON.stringify(response.body)}`);
          }
        });
      } else {
        throw new Error(`Falha ao obter credenciais dinâmicas para ${type}`);
      }
    });
  } else {
    // Credenciais já estão em memória
    const credentials = JSON.parse(credentialsJson);
    cy.log(`Usando credenciais dinâmicas ${type} da memória: ${credentials.email}`);

    cy.request({
      method: 'POST',
      url: '/login',
      body: {
        email: credentials.email,
        password: credentials.password
      },
      failOnStatusCode: false
    }).then((response) => {
      if (response.status === 200) {
        cy.log(`Login API ${type} bem-sucedido com credenciais da memória! Token obtido.`);
        // Armazenar automaticamente no localStorage
        cy.window().then((window) => {
          window.localStorage.setItem('token', response.body.authorization);
          cy.log(`Token armazenado automaticamente no localStorage`);
        });
      } else {
        cy.log(`Login ${type} falhou com credenciais da memória. Tentando recriar...`);
        // Remove credenciais inválidas da memória
        Cypress.env(envKey, null);
        
        // Tenta recriar credenciais
        cy.task('ensureDynamicCredentials', null, { timeout: 20000 }).then((newSessionCredentials: any) => {
          if (newSessionCredentials?.admin && newSessionCredentials?.user) {
            // Armazena novas credenciais na memória
            Cypress.env('DYNAMIC_ADMIN_CREDENTIALS', JSON.stringify(newSessionCredentials.admin));
            Cypress.env('DYNAMIC_USER_CREDENTIALS', JSON.stringify(newSessionCredentials.user));
            
            const newCredentials = type === 'admin' ? newSessionCredentials.admin : newSessionCredentials.user;
            
            // Tenta login novamente
            cy.request({
              method: 'POST',
              url: '/login',
              body: {
                email: newCredentials.email,
                password: newCredentials.password
              },
              failOnStatusCode: false
            }).then((retryResponse) => {
              if (retryResponse.status === 200) {
                cy.log(`Login API ${type} bem-sucedido após recriação! Token obtido.`);
                // Armazenar automaticamente no localStorage
                cy.window().then((window) => {
                  window.localStorage.setItem('token', retryResponse.body.authorization);
                  cy.log(`Token armazenado automaticamente no localStorage após recriação`);
                });
              } else {
                throw new Error(`Login ${type} falhou mesmo após recriação com status ${retryResponse.status}: ${JSON.stringify(retryResponse.body)}`);
              }
            });
          } else {
            throw new Error(`Falha ao recriar credenciais dinâmicas para ${type}`);
          }
        });
      }
    });
  }
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
    
    const headers: any = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = token;
    }

    const defaultOptions: Partial<Cypress.RequestOptions> = {
      method: 'POST',
      url: `${Cypress.env('apiUrl')}${endpoint}`,
      body,
      headers,
      failOnStatusCode: false
    };
    
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
    }
    
    const queryString = query ? '?' + new URLSearchParams(query).toString() : '';
    const defaultOptions: Partial<Cypress.RequestOptions> = {
      method: 'GET',
      url: `${Cypress.env('apiUrl')}${endpoint}${queryString}`,
      headers,
      failOnStatusCode: false
    };
    
    return cy.request({ ...defaultOptions, ...options });
  });
});
