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
    describe(`${config.entityName} CRUD API Tests`, () => {
      let createdId: string;
      let testData: any;

      beforeEach(() => {
        testData = config.generateTestData();
      });

      it('should create a new record (POST)', () => {
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

      it('should read the created record (GET)', () => {
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

      it('should list all records (GET)', () => {
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

      it('should update the record (PUT)', () => {
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

      it('should partially update the record (PATCH)', () => {
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

      it('should delete the record (DELETE)', () => {
        cy.apiDelete(`${config.endpoint}/${createdId}`).then((response) => {
          ApiUtils.validateResponse(response, 204);
        });

        // Verify record is deleted
        cy.apiRead(`${config.endpoint}/${createdId}`).then((response) => {
          expect(response.status).to.eq(404);
        });
      });

      it('should handle invalid requests properly', () => {
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
        describe('Additional Tests', () => {
          config.additionalTests!(createdId, testData);
        });
      }
    });
  }

  /**
   * Test API performance
   * @param endpoint - API endpoint
   * @param method - HTTP method
   * @param maxResponseTime - Maximum acceptable response time in ms
   */
  static testPerformance(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    maxResponseTime: number = 2000
  ): void {
    it(`should respond within ${maxResponseTime}ms`, () => {
      const startTime = Date.now();
      
      cy.request({
        method,
        url: ApiUtils.getUrl(endpoint),
        failOnStatusCode: false
      }).then(() => {
        const responseTime = Date.now() - startTime;
        expect(responseTime).to.be.lessThan(maxResponseTime);
      });
    });
  }

  /**
   * Test API authentication
   * @param endpoint - Protected endpoint
   * @param token - Valid auth token
   */
  static testAuthentication(endpoint: string, token?: string): void {
    describe('Authentication Tests', () => {
      it('should require authentication', () => {
        cy.request({
          method: 'GET',
          url: ApiUtils.getUrl(endpoint),
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(401);
        });
      });

      if (token) {
        it('should accept valid token', () => {
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

      it('should reject invalid token', () => {
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
    describe('Pagination Tests', () => {
      it('should support page parameter', () => {
        cy.apiList(endpoint, { page: 1, limit: 10 }).then((response) => {
          ApiUtils.validateResponse(response, 200);
          expect(response.body).to.be.an('array');
          expect(response.body.length).to.be.at.most(10);
        });
      });

      it('should support limit parameter', () => {
        cy.apiList(endpoint, { limit: 5 }).then((response) => {
          ApiUtils.validateResponse(response, 200);
          expect(response.body).to.be.an('array');
          expect(response.body.length).to.be.at.most(5);
        });
      });

      it('should handle invalid pagination parameters', () => {
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
    describe('Search Tests', () => {
      it('should support search parameter', () => {
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
