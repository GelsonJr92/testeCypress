/**
 * API Test Utilities
 * Contains helper functions for API testing
 */
export class ApiUtils {
  private static baseUrl = Cypress.env('apiUrl') || 'http://localhost:8080/api';

  /**
   * Set base URL for API calls
   * @param url - Base API URL
   */
  static setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  /**
   * Get full endpoint URL
   * @param endpoint - API endpoint
   */
  static getUrl(endpoint: string): string {
    return `${this.baseUrl}${endpoint}`;
  }

  /**
   * Validate API response structure
   * @param response - Cypress response
   * @param expectedStatus - Expected status code
   * @param schema - Optional JSON schema for validation
   */
  static validateResponse(
    response: Cypress.Response<any>, 
    expectedStatus: number = 200,
    schema?: any
  ): void {
    expect(response.status).to.eq(expectedStatus);
    expect(response.headers).to.have.property('content-type');
    
    if (response.body) {
      expect(response.body).to.not.be.null;
      
      if (schema) {
        this.validateJsonSchema(response.body, schema);
      }
    }
  }

  /**
   * Validate JSON schema (basic implementation)
   * @param data - Data to validate
   * @param schema - Schema object
   */
  static validateJsonSchema(data: any, schema: any): void {
    Object.keys(schema).forEach(key => {
      expect(data).to.have.property(key);
      
      if (schema[key].type) {
        expect(typeof data[key]).to.eq(schema[key].type);
      }
      
      if (schema[key].required && schema[key].required === true) {
        expect(data[key]).to.not.be.undefined;
        expect(data[key]).to.not.be.null;
      }
    });
  }

  /**
   * Common CRUD API test suite
   * @param config - Test configuration
   */
  static runCrudTests(config: CrudTestConfig): void {
    describe(`Testes de API CRUD para ${config.entityName}`, () => {
      let createdId: string;
      let testData: any;

      beforeEach(() => {
        testData = config.generateTestData();
      });

      it('deve criar um novo registro (POST)', () => {
        cy.apiCreate(config.endpoint, testData).then((response) => {
          ApiUtils.validateResponse(response, 201, config.responseSchema);
          createdId = response.body.id || response.body._id;
          expect(createdId).to.exist;
          
          // Validate created data
          if (config.validateFields) {
            config.validateFields.forEach(field => {
              expect(response.body[field]).to.eq(testData[field]);
            });
          }
        });
      });

      it('deve ler o registro criado (GET)', () => {
        cy.apiRead(`${config.endpoint}/${createdId}`).then((response) => {
          ApiUtils.validateResponse(response, 200, config.responseSchema);
          expect(response.body.id || response.body._id).to.eq(createdId);
          
          // Validate retrieved data
          if (config.validateFields) {
            config.validateFields.forEach(field => {
              expect(response.body[field]).to.eq(testData[field]);
            });
          }
        });
      });

      it('deve listar todos os registros (GET)', () => {
        cy.apiList(config.endpoint).then((response) => {
          ApiUtils.validateResponse(response, 200);
          expect(response.body).to.be.an('array');
          expect(response.body.length).to.be.greaterThan(0);
          
          // Check if created record exists in list
          const foundRecord = response.body.find((item: any) => 
            (item.id || item._id) === createdId
          );
          expect(foundRecord).to.exist;
        });
      });

      it('deve atualizar o registro (PUT)', () => {
        const updateData = config.generateUpdateData ? 
          config.generateUpdateData() : 
          { ...testData, name: 'Updated Name' };

        cy.apiUpdate(`${config.endpoint}/${createdId}`, updateData).then((response) => {
          ApiUtils.validateResponse(response, 200, config.responseSchema);
          
          // Validate updated data
          if (config.validateFields) {
            config.validateFields.forEach(field => {
              if (updateData[field] !== undefined) {
                expect(response.body[field]).to.eq(updateData[field]);
              }
            });
          }
        });
      });

      it('deve atualizar parcialmente o registro (PATCH)', () => {
        const patchData = { name: 'Patched Name' };

        cy.request({
          method: 'PATCH',
          url: ApiUtils.getUrl(`${config.endpoint}/${createdId}`),
          body: patchData,
          headers: { 'Content-Type': 'application/json' },
          failOnStatusCode: false
        }).then((response) => {
          // PATCH might not be implemented, so accept 200 or 405
          expect(response.status).to.be.oneOf([200, 405]);
          
          if (response.status === 200) {
            expect(response.body.name).to.eq(patchData.name);
          }
        });
      });

      it('deve excluir o registro (DELETE)', () => {
        cy.apiDelete(`${config.endpoint}/${createdId}`).then((response) => {
          ApiUtils.validateResponse(response, 204);
        });

        // Verify record is deleted
        cy.apiRead(`${config.endpoint}/${createdId}`).then((response) => {
          expect(response.status).to.eq(404);
        });
      });

      it('deve tratar requisições inválidas adequadamente', () => {
        // Test invalid POST data
        cy.apiCreate(config.endpoint, {}).then((response) => {
          expect(response.status).to.be.oneOf([400, 422]);
        });

        // Test non-existent record
        cy.apiRead(`${config.endpoint}/non-existent-id`).then((response) => {
          expect(response.status).to.eq(404);
        });

        // Test invalid update
        cy.apiUpdate(`${config.endpoint}/non-existent-id`, testData).then((response) => {
          expect(response.status).to.eq(404);
        });

        // Test invalid delete
        cy.apiDelete(`${config.endpoint}/non-existent-id`).then((response) => {
          expect(response.status).to.eq(404);
        });
      });      if (config.additionalTests) {
        describe('Testes Adicionais', () => {
          config.additionalTests!(createdId, testData);
        });
      }
    });
  }

  /**
   * Test API performance
   * @param endpoint - API endpoint to test
   * @param method - HTTP method
   * @param maxResponseTime - Maximum response time in milliseconds
   */  static testarPerformance(endpoint: string, method: string = 'GET', maxResponseTime: number = 2000): void {
    describe(`Testes de Performance para ${method} ${endpoint}`, () => {
      it(`Deve responder em até ${maxResponseTime}ms para ${method} ${endpoint}`, () => {
        const startTime = Date.now();
        
        cy.request({
          method: method,
          url: ApiUtils.getUrl(endpoint),
          failOnStatusCode: false
        }).then((response) => {
          const responseTime = Date.now() - startTime;
          expect(responseTime, `Response time for ${method} ${endpoint}`).to.be.lessThan(maxResponseTime);
          cy.log(`Response time: ${responseTime}ms`);
        });
      });
    });
  }

  /**
   * Test API authentication
   * @param endpoint - Protected endpoint
   * @param token - Valid auth token
   */
  static testAuthentication(endpoint: string, token?: string): void {
    describe('Testes de Autenticação', () => {
      it('deve exigir autenticação', () => {
        cy.request({
          method: 'GET',
          url: ApiUtils.getUrl(endpoint),
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(401);
        });
      });

      if (token) {
        it('deve aceitar token válido', () => {
          cy.request({
            method: 'GET',
            url: ApiUtils.getUrl(endpoint),
            headers: { 'Authorization': `Bearer ${token}` },
            failOnStatusCode: false
          }).then((response) => {
            expect(response.status).to.not.eq(401);
          });
        });
      }

      it('deve rejeitar token inválido', () => {
        cy.request({
          method: 'GET',
          url: ApiUtils.getUrl(endpoint),
          headers: { 'Authorization': 'Bearer invalid-token' },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(401);
        });
      });
    });
  }

  /**
   * Test pagination
   * @param endpoint - API endpoint that supports pagination
   */
  static testPagination(endpoint: string): void {
    describe('Testes de Paginação', () => {
      it('deve suportar parâmetro de página', () => {
        cy.apiList(endpoint, { page: 1, limit: 10 }).then((response) => {
          ApiUtils.validateResponse(response, 200);
          expect(response.body).to.be.an('array');
          expect(response.body.length).to.be.at.most(10);
        });
      });

      it('deve suportar parâmetro de limite', () => {
        cy.apiList(endpoint, { limit: 5 }).then((response) => {
          ApiUtils.validateResponse(response, 200);
          expect(response.body).to.be.an('array');
          expect(response.body.length).to.be.at.most(5);
        });
      });

      it('deve tratar parâmetros de paginação inválidos', () => {
        cy.apiList(endpoint, { page: -1, limit: -1 }).then((response) => {
          // Should either use defaults or return error
          expect(response.status).to.be.oneOf([200, 400]);
        });
      });
    });
  }

  /**
   * Test search functionality
   * @param endpoint - API endpoint that supports search
   * @param searchTerm - Term to search for
   */
  static testSearch(endpoint: string, searchTerm: string): void {
    describe('Testes de Busca', () => {
      it('deve suportar parâmetro de busca', () => {
        cy.apiList(endpoint, { search: searchTerm }).then((response) => {
          ApiUtils.validateResponse(response, 200);
          expect(response.body).to.be.an('array');
        });
      });

      it('should return empty results for non-existent search', () => {
        cy.apiList(endpoint, { search: 'nonexistentterm12345' }).then((response) => {
          ApiUtils.validateResponse(response, 200);
          expect(response.body).to.be.an('array');
          expect(response.body.length).to.eq(0);
        });
      });
    });
  }

  /**
   * Test authentication on endpoints
   * @param endpoint - API endpoint to test
   * @param method - HTTP method
   */
  static testarAutenticacaoEndpoint(endpoint: string, method: string): void {
    const chaveEndpoint = `${method} ${endpoint}`;
    const endpointComId = endpoint.includes('{_id}');
    
    // Mapear endpoints públicos (não precisam autenticação)
    const endpointsPublicos = [
      'GET /usuarios',
      'GET /usuarios/{_id}',
      'POST /usuarios',
      'PUT /usuarios/{_id}',
      'DELETE /usuarios/{_id}',
      'GET /produtos',
      'GET /produtos/{_id}'
    ];
    
    // Mapear endpoints privados (precisam autenticação)
    const endpointsPrivados = [
      'POST /produtos',
      'PUT /produtos/{_id}',
      'DELETE /produtos/{_id}'
    ];
    
    const ehPublico = endpointsPublicos.includes(chaveEndpoint);
    const ehPrivado = endpointsPrivados.includes(chaveEndpoint);

    describe(`Testes de Autenticação para ${method} ${endpoint}`, () => {
      it('Deve retornar resposta adequada ao tentar acessar sem token', () => {
        const urlTeste = endpointComId ? 
          `https://serverest.dev${endpoint.replace('{_id}', '1234567890123456')}` : 
          `https://serverest.dev${endpoint}`;

        cy.request({
          method: method,
          url: urlTeste,
          failOnStatusCode: false,
        }).then((resposta) => {
          if (ehPublico) {
            if (chaveEndpoint === 'DELETE /usuarios/{_id}') {
              expect(resposta.status).to.eq(200);
            } else if (chaveEndpoint === 'POST /usuarios') {
              expect([201, 400]).to.include(resposta.status);
            } else {
              expect([200, 400]).to.include(resposta.status);
            }
          } else if (ehPrivado) {
            expect(resposta.status).to.eq(401);
          } else {
            expect([200, 400, 401]).to.include(resposta.status);
          }
        });
      });

      it('Deve retornar sucesso ou erro específico com token válido', () => {
        cy.loginApiServeRest().then((token) => {
          expect(token).to.exist;

          const urlTeste = endpointComId ? 
            `https://serverest.dev${endpoint.replace('{_id}', '1234567890123456')}` : 
            `https://serverest.dev${endpoint}`;

          let requestOptions: any = {
            method: method,
            url: urlTeste,
            headers: {
              'Authorization': token
            },
            failOnStatusCode: false 
          };

          // Para POST e PUT de usuários, precisamos enviar dados válidos
          if (chaveEndpoint === 'POST /usuarios' || chaveEndpoint === 'PUT /usuarios/{_id}') {
            requestOptions.body = {
              nome: `Teste Auth User ${Date.now()}`,
              email: `testauth${Date.now()}@teste.com`,
              password: 'teste123',
              administrador: 'false'
            };
          }

          cy.request(requestOptions).then((resposta) => {
            if (ehPublico) {
              if (chaveEndpoint === 'DELETE /usuarios/{_id}') {
                // ⚠️ BUG DA API SERVEREST: DELETE com ID inexistente deveria retornar 404/400,
                // mas está retornando 200 (sucesso) mesmo quando o usuário não existe.
                expect(resposta.status).to.eq(200);
              } else if (chaveEndpoint === 'PUT /usuarios/{_id}') {
                // ⚠️ BUG DA API SERVEREST: PUT com ID inexistente deveria retornar 404/400, 
                // mas está criando um novo usuário e retornando 201. Isso viola o padrão REST.
                expect(resposta.status).to.eq(201);
              } else if (chaveEndpoint === 'POST /usuarios') {
                expect(resposta.status).to.eq(201);
              } else if (endpointComId) {
                expect(resposta.status).to.eq(400);
                expect(resposta.body.message).to.include('não encontrado');
              } else {
                expect(resposta.status).to.eq(200);
              }
            } else if (ehPrivado) {
              expect(resposta.status).to.not.eq(401);
              
              if (endpointComId) {
                if (chaveEndpoint === 'DELETE /produtos/{_id}') {
                  // ⚠️ BUG DA API SERVEREST: DELETE com ID inexistente deveria retornar 404/400,
                  // mas está retornando 200 (sucesso) mesmo quando o produto não existe.
                  expect(resposta.status).to.eq(200);
                } else {
                  expect(resposta.status).to.eq(400);
                }
              }
            } else {
              expect(resposta.status).to.not.eq(401);
            }
          });
        });
      });

      it('Deve retornar 401 Unauthorized ao tentar acessar com token inválido', () => {
        const urlTeste = endpointComId ? 
          `https://serverest.dev${endpoint.replace('{_id}', '1234567890123456')}` : 
          `https://serverest.dev${endpoint}`;
          
        cy.request({
          method: method,
          url: urlTeste,
          headers: { 'Authorization': 'Bearer tokenmuitoinvalido123' },
          failOnStatusCode: false, 
        }).then((resposta) => {
          if (ehPublico) {
            if (chaveEndpoint === 'DELETE /usuarios/{_id}') {
              expect(resposta.status).to.eq(200);
            } else if (chaveEndpoint === 'POST /usuarios') {
              expect([201, 400]).to.include(resposta.status);
            } else {
              expect([200, 400]).to.include(resposta.status);
            }
          } else if (ehPrivado) {
            if (endpointComId) {
              expect([400, 401]).to.include(resposta.status);
            } else {
              expect(resposta.status).to.eq(401);
            }
          } else {
            expect([200, 400, 401]).to.include(resposta.status);
          }
        });
      });
    });
  }

  /**
   * Test pagination functionality
   * @param endpoint - Endpoint that supports pagination
   * @param nomeArrayResultados - Name of the property in response body that contains the results array
   */
  static testarPaginacao(endpoint: string, nomeArrayResultados: string): void {
    describe(`Testes de Paginação para ${endpoint}`, () => {
      it('Deve retornar estrutura padrão sem parâmetros de paginação', () => {
        cy.apiList(endpoint, {}).then((resposta) => {
          expect(resposta.status).to.eq(200);
          expect(resposta.body).to.have.property(nomeArrayResultados).and.to.be.an('array');
          expect(resposta.body).to.have.property('quantidade').and.to.be.a('number');
        });
      });

      it('Deve retornar erro 400 para parâmetros de paginação não suportados', () => {
        cy.apiList(endpoint, { _page: 1, _limit: 2 }).then((resposta) => {
          expect(resposta.status).to.eq(400);
          expect(resposta.body).to.have.property('_page');
          expect(resposta.body).to.have.property('_limit');
        });
      });

      it('Deve retornar erro 400 para parâmetros inválidos', () => {
        cy.apiList(endpoint, { parametroInvalido: 'valor' }).then((resposta) => {
          expect(resposta.status).to.eq(400);
          expect(resposta.body).to.have.property('parametroInvalido');
        });
      });
    });
  }

  /**
   * Test search functionality
   * @param endpoint - Endpoint that supports search
   * @param queryParams - Object with search parameters and their values
   * @param nomeArrayResultados - Name of the property in response body that contains the results array
   * @param verificarResultadosFn - Optional function to perform specific assertions on search results
   */
  static testarBusca(
    endpoint: string,
    queryParams: { [key: string]: string | number | boolean },
    nomeArrayResultados: string,
    verificarResultadosFn?: (resultados: any[]) => void
  ): void {
    describe(`Testes de Busca para ${endpoint} com ${JSON.stringify(queryParams)}`, () => {
      it('Deve retornar resultados correspondentes à busca', () => {
        cy.apiList(endpoint, queryParams).then((resposta) => {
          expect(resposta.status).to.eq(200);
          expect(resposta.body).to.have.property(nomeArrayResultados).and.to.be.an('array');
          if (verificarResultadosFn) {
            verificarResultadosFn(resposta.body[nomeArrayResultados]);
          }
        });
      });

      it('Deve retornar array vazio para busca sem resultados', () => {
        const paramsBuscaSemResultado = { ...queryParams };
        const primeiraChave = Object.keys(paramsBuscaSemResultado)[0];
        
        if (typeof paramsBuscaSemResultado[primeiraChave] === 'number') {
          paramsBuscaSemResultado[primeiraChave] = 999999999;
        } else if (typeof paramsBuscaSemResultado[primeiraChave] === 'boolean') {
          paramsBuscaSemResultado[primeiraChave] = !paramsBuscaSemResultado[primeiraChave];
        } else {
          paramsBuscaSemResultado[primeiraChave] = 'TermoDeBuscaMuitoInexistente123XYZ';
        }

        cy.apiList(endpoint, paramsBuscaSemResultado).then((resposta) => {
          if (resposta.status === 400) {
            expect(resposta.body).to.have.property(Object.keys(paramsBuscaSemResultado)[0]);
          } else {
            expect(resposta.status).to.eq(200);
            expect(resposta.body).to.have.property(nomeArrayResultados).and.to.be.an('array');
            expect(resposta.body[nomeArrayResultados].length).to.eq(0);
            expect(resposta.body.quantidade).to.eq(0);
          }
        });
      });
    });
  }
}

// ===============================================
// TYPE DEFINITIONS
// ===============================================

export interface CrudTestConfig {
  entityName: string;
  endpoint: string;
  generateTestData: () => any;
  generateUpdateData?: () => any;
  responseSchema?: any;
  validateFields?: string[];
  additionalTests?: (createdId: string, testData: any) => void;
}

export interface ApiTestSchema {
  [key: string]: {
    type: string;
    required?: boolean;
  };
}
