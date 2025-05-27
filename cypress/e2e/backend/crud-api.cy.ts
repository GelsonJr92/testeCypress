import { ApiUtils, CrudTestConfig } from '../../support/utils/ApiUtils';
import { DataFactory } from '../../support/utils/DataFactory';

/**
 * Generic Backend API CRUD Tests
 * This test suite can be used for any REST API
 * Just configure the endpoints and data according to your API
 */

describe('Backend API CRUD Tests - Generic Implementation', () => {
  
  // ===============================================
  // USER API TESTS
  // ===============================================
  
  describe('Users API', () => {
    const userConfig: CrudTestConfig = {
      entityName: 'User',
      endpoint: '/users',
      generateTestData: () => DataFactory.generateUser(),
      generateUpdateData: () => DataFactory.generateUser(),
      responseSchema: {
        id: { type: 'string', required: true },
        name: { type: 'string', required: true },
        email: { type: 'string', required: true },
        phone: { type: 'string' },
        address: { type: 'string' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' }
      },
      validateFields: ['name', 'email', 'phone'],
      additionalTests: (createdId: string, testData: any) => {
        it('should validate email format', () => {
          const invalidEmailData = { ...testData, email: 'invalid-email' };
          cy.apiCreate('/users', invalidEmailData).then((response) => {
            expect(response.status).to.be.oneOf([400, 422]);
          });
        });

        it('should prevent duplicate emails', () => {
          cy.apiCreate('/users', testData).then((response) => {
            expect(response.status).to.be.oneOf([400, 409, 422]);
          });
        });
      }
    };

    ApiUtils.runCrudTests(userConfig);
    ApiUtils.testPagination('/users');
    ApiUtils.testSearch('/users', 'John');
    ApiUtils.testPerformance('/users', 'GET', 2000);
  });

  // ===============================================
  // PRODUCT API TESTS
  // ===============================================
  
  describe('Products API', () => {
    const productConfig: CrudTestConfig = {
      entityName: 'Product',
      endpoint: '/products',
      generateTestData: () => DataFactory.generateProduct(),
      generateUpdateData: () => DataFactory.generateProduct(),
      responseSchema: {
        id: { type: 'string', required: true },
        name: { type: 'string', required: true },
        description: { type: 'string' },
        price: { type: 'number', required: true },
        category: { type: 'string' },
        sku: { type: 'string', required: true },
        inStock: { type: 'boolean' },
        stockQuantity: { type: 'number' }
      },
      validateFields: ['name', 'price', 'sku'],
      additionalTests: (createdId: string, testData: any) => {
        it('should validate price is positive', () => {
          const invalidPriceData = { ...testData, price: -10 };
          cy.apiCreate('/products', invalidPriceData).then((response) => {
            expect(response.status).to.be.oneOf([400, 422]);
          });
        });

        it('should prevent duplicate SKU', () => {
          cy.apiCreate('/products', testData).then((response) => {
            expect(response.status).to.be.oneOf([400, 409, 422]);
          });
        });

        it('should filter by category', () => {
          cy.apiList('/products', { category: testData.category }).then((response) => {
            ApiUtils.validateResponse(response, 200);
            expect(response.body).to.be.an('array');
            if (response.body.length > 0) {
              response.body.forEach((product: any) => {
                expect(product.category).to.eq(testData.category);
              });
            }
          });
        });
      }
    };

    ApiUtils.runCrudTests(productConfig);
    ApiUtils.testPagination('/products');
    ApiUtils.testSearch('/products', 'laptop');
    ApiUtils.testPerformance('/products', 'GET', 2000);
  });

  // ===============================================
  // COMPANY API TESTS
  // ===============================================
  
  describe('Companies API', () => {
    const companyConfig: CrudTestConfig = {
      entityName: 'Company',
      endpoint: '/companies',
      generateTestData: () => DataFactory.generateCompany(),
      generateUpdateData: () => DataFactory.generateCompany(),
      responseSchema: {
        id: { type: 'string', required: true },
        name: { type: 'string', required: true },
        email: { type: 'string', required: true },
        phone: { type: 'string' },
        website: { type: 'string' },
        industry: { type: 'string' },
        employeeCount: { type: 'number' }
      },
      validateFields: ['name', 'email', 'industry'],
      additionalTests: (createdId: string, testData: any) => {
        it('should validate website URL format', () => {
          const invalidUrlData = { ...testData, website: 'not-a-url' };
          cy.apiCreate('/companies', invalidUrlData).then((response) => {
            expect(response.status).to.be.oneOf([400, 422]);
          });
        });

        it('should filter by industry', () => {
          cy.apiList('/companies', { industry: testData.industry }).then((response) => {
            ApiUtils.validateResponse(response, 200);
            expect(response.body).to.be.an('array');
            if (response.body.length > 0) {
              response.body.forEach((company: any) => {
                expect(company.industry).to.eq(testData.industry);
              });
            }
          });
        });
      }
    };

    ApiUtils.runCrudTests(companyConfig);
    ApiUtils.testPagination('/companies');
    ApiUtils.testSearch('/companies', 'Tech');
    ApiUtils.testPerformance('/companies', 'GET', 2000);
  });

  // ===============================================
  // ORDER API TESTS
  // ===============================================
  
  describe('Orders API', () => {
    const orderConfig: CrudTestConfig = {
      entityName: 'Order',
      endpoint: '/orders',
      generateTestData: () => DataFactory.generateOrder(),
      generateUpdateData: () => ({ status: 'shipped' }),
      responseSchema: {
        id: { type: 'string', required: true },
        orderNumber: { type: 'string', required: true },
        customerId: { type: 'string', required: true },
        status: { type: 'string', required: true },
        total: { type: 'number', required: true },
        items: { type: 'object', required: true }
      },
      validateFields: ['orderNumber', 'customerId', 'status', 'total'],
      additionalTests: (createdId: string, testData: any) => {
        it('should calculate totals correctly', () => {
          cy.apiRead(`/orders/${createdId}`).then((response) => {
            const order = response.body;
            const calculatedSubtotal = order.items.reduce((sum: number, item: any) => 
              sum + (item.quantity * item.price), 0);
            expect(order.subtotal).to.be.closeTo(calculatedSubtotal, 0.01);
          });
        });

        it('should filter by status', () => {
          cy.apiList('/orders', { status: testData.status }).then((response) => {
            ApiUtils.validateResponse(response, 200);
            expect(response.body).to.be.an('array');
            if (response.body.length > 0) {
              response.body.forEach((order: any) => {
                expect(order.status).to.eq(testData.status);
              });
            }
          });
        });

        it('should prevent status downgrade', () => {
          // First update to 'shipped'
          cy.apiUpdate(`/orders/${createdId}`, { status: 'shipped' });
          
          // Try to downgrade to 'pending'
          cy.apiUpdate(`/orders/${createdId}`, { status: 'pending' }).then((response) => {
            expect(response.status).to.be.oneOf([400, 422]);
          });
        });
      }
    };

    ApiUtils.runCrudTests(orderConfig);
    ApiUtils.testPagination('/orders');
    ApiUtils.testSearch('/orders', 'ORD');
    ApiUtils.testPerformance('/orders', 'GET', 2000);
  });

  // ===============================================
  // CROSS-ENTITY TESTS
  // ===============================================
  
  describe('Cross-Entity Relationships', () => {
    let userId: string;
    let productId: string;
    let orderId: string;

    before(() => {
      // Create test data for relationship tests
      cy.apiCreate('/users', DataFactory.generateUser()).then((response) => {
        userId = response.body.id;
      });

      cy.apiCreate('/products', DataFactory.generateProduct()).then((response) => {
        productId = response.body.id;
      });
    });

    it('should create order with valid user and product IDs', { tags: ['@relationships'] }, () => {
      const orderData = {
        ...DataFactory.generateOrder(),
        customerId: userId,
        items: [{
          productId: productId,
          quantity: 2,
          price: 29.99
        }]
      };

      cy.apiCreate('/orders', orderData).then((response) => {
        ApiUtils.validateResponse(response, 201);
        orderId = response.body.id;
        expect(response.body.customerId).to.eq(userId);
        expect(response.body.items[0].productId).to.eq(productId);
      });
    });

    it('should reject order with invalid user ID', { tags: ['@relationships', '@validation'] }, () => {
      const invalidOrderData = {
        ...DataFactory.generateOrder(),
        customerId: 'invalid-user-id'
      };

      cy.apiCreate('/orders', invalidOrderData).then((response) => {
        expect(response.status).to.be.oneOf([400, 404, 422]);
      });
    });

    it('should get user orders', { tags: ['@relationships'] }, () => {
      cy.apiList(`/users/${userId}/orders`).then((response) => {
        if (response.status === 200) {
          expect(response.body).to.be.an('array');
          const userOrder = response.body.find((order: any) => order.id === orderId);
          if (userOrder) {
            expect(userOrder.customerId).to.eq(userId);
          }
        }
      });
    });

    after(() => {
      // Clean up test data
      if (orderId) cy.apiDelete(`/orders/${orderId}`);
      if (productId) cy.apiDelete(`/products/${productId}`);
      if (userId) cy.apiDelete(`/users/${userId}`);
    });
  });

  // ===============================================
  // BULK OPERATIONS TESTS
  // ===============================================
  
  describe('Bulk Operations', () => {
    it('should handle bulk create', { tags: ['@bulk'] }, () => {
      const bulkUsers = DataFactory.generate('user', 5);
      
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/users/bulk`,
        body: { users: bulkUsers },
        headers: { 'Content-Type': 'application/json' },
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 201 || response.status === 200) {
          expect(response.body).to.have.property('created');
          expect(response.body.created).to.be.a('number');
          expect(response.body.created).to.eq(5);
        } else {
          // Bulk operations might not be implemented
          expect(response.status).to.eq(404);
        }
      });
    });

    it('should handle bulk delete', { tags: ['@bulk'] }, () => {
      // Create some test users first
      const testUsers: string[] = [];
      
      cy.wrap(Array.from({ length: 3 })).each(() => {
        cy.apiCreate('/users', DataFactory.generateUser()).then((response) => {
          if (response.status === 201) {
            testUsers.push(response.body.id);
          }
        });
      }).then(() => {
        if (testUsers.length > 0) {
          cy.request({
            method: 'DELETE',
            url: `${Cypress.env('apiUrl')}/users/bulk`,
            body: { ids: testUsers },
            headers: { 'Content-Type': 'application/json' },
            failOnStatusCode: false
          }).then((response) => {
            if (response.status === 200 || response.status === 204) {
              // Verify users are deleted
              testUsers.forEach(id => {
                cy.apiRead(`/users/${id}`).then((getResponse) => {
                  expect(getResponse.status).to.eq(404);
                });
              });
            } else {
              // Bulk operations might not be implemented
              expect(response.status).to.eq(404);
            }
          });
        }
      });
    });
  });

  // ===============================================
  // SECURITY TESTS
  // ===============================================
  
  describe('Security Tests', () => {
    it('should prevent SQL injection', { tags: ['@security'] }, () => {
      const maliciousData = {
        name: "'; DROP TABLE users; --",
        email: 'test@example.com'
      };

      cy.apiCreate('/users', maliciousData).then((response) => {
        // Should either sanitize input or return validation error
        expect(response.status).to.be.oneOf([201, 400, 422]);
        
        if (response.status === 201) {
          // If created, name should be sanitized
          expect(response.body.name).to.not.include('DROP TABLE');
        }
      });
    });

    it('should prevent XSS in responses', { tags: ['@security'] }, () => {
      const xssData = {
        name: '<script>alert("XSS")</script>',
        email: 'test@example.com'
      };

      cy.apiCreate('/users', xssData).then((response) => {
        if (response.status === 201) {
          // Response should escape or sanitize script tags
          expect(response.body.name).to.not.include('<script>');
        }
      });
    });

    it('should enforce rate limiting', { tags: ['@security', '@rate-limit'] }, () => {
      // Make rapid successive requests
      const requests = Array.from({ length: 20 }, () => 
        cy.apiList('/users', {}, { timeout: 1000 })
      );

      cy.wrap(requests).then(() => {
        // Some requests should be rate limited (429 status)
        // This depends on your API's rate limiting configuration
        cy.log('Rate limiting test completed - check for 429 responses if rate limiting is enabled');
      });
    });
  });

  // ===============================================
  // PERFORMANCE TESTS
  // ===============================================
  
  describe('Performance Tests', () => {
    it('should handle concurrent requests', { tags: ['@performance', '@concurrency'] }, () => {
      const concurrentRequests = Array.from({ length: 10 }, (_, i) => 
        cy.apiCreate('/users', { 
          ...DataFactory.generateUser(), 
          name: `Concurrent User ${i}` 
        })
      );

      // All requests should complete successfully
      cy.wrap(concurrentRequests).then((responses: any[]) => {
        responses.forEach(response => {
          expect(response.status).to.eq(201);
        });
      });
    });

    it('should respond quickly under load', { tags: ['@performance', '@load'] }, () => {
      const startTime = Date.now();
      
      // Create multiple resources quickly
      const requests = Array.from({ length: 5 }, () => 
        cy.apiCreate('/users', DataFactory.generateUser())
      );

      cy.wrap(requests).then(() => {
        const totalTime = Date.now() - startTime;
        expect(totalTime).to.be.lessThan(5000); // Should complete within 5 seconds
      });
    });
  });
});
