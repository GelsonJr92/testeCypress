import { CrudPage } from '../../support/pages/CrudPage';
import { DataFactory } from '../../support/utils/DataFactory';

/**
 * Generic Frontend CRUD Tests
 * This test suite can be used for any CRUD interface
 * Just configure the selectors and data according to your application
 */

describe('Frontend CRUD Tests - Generic Implementation', () => {
  const crudPage = new CrudPage('/users'); // Change URL according to your app
  let testUser: any;
  let updatedUser: any;

  beforeEach(() => {
    // Generate fresh test data for each test
    testUser = DataFactory.generateUser();
    updatedUser = DataFactory.generateUser();
    
    // Visit the CRUD page
    crudPage.visit();
    
    // Optional: Configure custom selectors if your app uses different ones
    // crudPage.setSelectors({
    //   form: '#user-form',
    //   table: '#users-table',
    //   addBtn: '.add-user-btn'
    // });
  });

  afterEach(() => {
    // Clean up test data
    cy.cleanupTestData();
  });

  describe('Create Operations', () => {
    it('should create a new user successfully', { tags: ['@create', '@smoke'] }, () => {
      // Test the complete create flow
      crudPage.createRecord({
        name: testUser.name,
        email: testUser.email,
        phone: testUser.phone,
        address: testUser.address
      });

      // Verify the record appears in the table
      crudPage.verifyTableContains({
        name: testUser.name,
        email: testUser.email
      });
    });

    it('should validate required fields on create', { tags: ['@create', '@validation'] }, () => {
      crudPage.clickAdd();
      crudPage.submitForm();
      
      // Should show validation errors
      crudPage.verifyErrorMessage();
    });

    it('should show success notification after create', { tags: ['@create', '@ui'] }, () => {
      crudPage.createRecord({
        name: testUser.name,
        email: testUser.email
      });

      cy.verifyNotification('User created successfully', 'success');
    });
  });

  describe('Read Operations', () => {
    beforeEach(() => {
      // Create a user for read tests
      crudPage.createRecord({
        name: testUser.name,
        email: testUser.email,
        phone: testUser.phone
      });
    });

    it('should display user in table', { tags: ['@read', '@smoke'] }, () => {
      crudPage.verifyTableContains({
        name: testUser.name,
        email: testUser.email
      });
    });

    it('should search for users', { tags: ['@read', '@search'] }, () => {
      // Search by name
      crudPage.search(testUser.name);
      crudPage.verifyTableContains({ name: testUser.name });

      // Search by email
      crudPage.clearSearch();
      crudPage.search(testUser.email);
      crudPage.verifyTableContains({ email: testUser.email });

      // Search for non-existent user
      crudPage.clearSearch();
      crudPage.search('nonexistentuser123');
      crudPage.verifyTableEmpty();
    });

    it('should handle pagination', { tags: ['@read', '@pagination'] }, () => {
      // This test assumes multiple records exist
      // You might need to create more test data first
      
      cy.get('body').then(($body) => {
        if ($body.find('[data-cy="pagination"]').length > 0) {
          crudPage.goToNextPage();
          cy.url().should('include', 'page=2');
          
          crudPage.goToPreviousPage();
          cy.url().should('include', 'page=1');
        } else {
          cy.log('Pagination not available - skipping test');
        }
      });
    });
  });

  describe('Update Operations', () => {
    beforeEach(() => {
      // Create a user for update tests
      crudPage.createRecord({
        name: testUser.name,
        email: testUser.email,
        phone: testUser.phone
      });
    });

    it('should update user successfully', { tags: ['@update', '@smoke'] }, () => {
      crudPage.editRecord(testUser.name, {
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone
      });

      // Verify updated data appears in table
      crudPage.verifyTableContains({
        name: updatedUser.name,
        email: updatedUser.email
      });

      // Verify old data is no longer visible
      cy.get('body').should('not.contain', testUser.name);
    });

    it('should validate required fields on update', { tags: ['@update', '@validation'] }, () => {
      crudPage.clickEditForRow(testUser.name);
      
      // Clear required field and try to submit
      crudPage.fillForm({ name: '' });
      crudPage.submitForm();
      
      // Should show validation error
      crudPage.verifyErrorMessage();
    });

    it('should cancel update operation', { tags: ['@update', '@ui'] }, () => {
      crudPage.clickEditForRow(testUser.name);
      crudPage.fillForm({ name: 'Changed Name' });
      crudPage.cancelForm();

      // Should return to list and show original data
      crudPage.verifyTableContains({ name: testUser.name });
    });
  });

  describe('Delete Operations', () => {
    beforeEach(() => {
      // Create a user for delete tests
      crudPage.createRecord({
        name: testUser.name,
        email: testUser.email,
        phone: testUser.phone
      });
    });

    it('should delete user successfully', { tags: ['@delete', '@smoke'] }, () => {
      crudPage.deleteRecord(testUser.name);
      
      // Verify record is removed from table
      crudPage.verifyRecordDeleted(testUser.name);
      cy.verifyNotification('User deleted successfully', 'success');
    });

    it('should show confirmation dialog before delete', { tags: ['@delete', '@ui'] }, () => {
      crudPage.clickDeleteForRow(testUser.name);
      
      // Modal should be visible
      cy.get('[data-cy="modal"], .modal').should('be.visible');
      cy.get('[data-cy="modal"], .modal').should('contain', 'Are you sure');
      
      // Cancel deletion
      cy.get('[data-cy="cancel"], .btn-cancel').click();
      
      // Record should still exist
      crudPage.verifyTableContains({ name: testUser.name });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle network errors gracefully', { tags: ['@error', '@network'] }, () => {
      // Simulate network failure
      cy.intercept('POST', '**/api/**', { forceNetworkError: true }).as('networkError');
      
      crudPage.createRecord({
        name: testUser.name,
        email: testUser.email
      });

      cy.wait('@networkError');
      crudPage.verifyErrorMessage();
    });

    it('should handle server errors gracefully', { tags: ['@error', '@server'] }, () => {
      // Simulate server error
      cy.intercept('POST', '**/api/**', { statusCode: 500 }).as('serverError');
      
      crudPage.createRecord({
        name: testUser.name,
        email: testUser.email
      });

      cy.wait('@serverError');
      crudPage.verifyErrorMessage();
    });

    it('should handle duplicate data appropriately', { tags: ['@error', '@validation'] }, () => {
      // Create first user
      crudPage.createRecord({
        name: testUser.name,
        email: testUser.email
      });

      // Try to create duplicate
      crudPage.createRecord({
        name: testUser.name,
        email: testUser.email
      });

      // Should show appropriate error message
      crudPage.verifyErrorMessage();
    });
  });

  describe('Accessibility Tests', () => {    it('should be keyboard navigable', { tags: ['@a11y', '@keyboard'] }, () => {
      // Test keyboard navigation
      cy.get('body').realClick();
      cy.realPress('Tab');
      cy.focused().should('be.visible');
      
      // Navigate through interactive elements
      cy.realPress('Tab');
      cy.realPress('Tab');
      cy.realPress('Enter');
    });    it('should have proper ARIA attributes', { tags: ['@a11y', '@aria'] }, () => {
      // Check for common ARIA attributes
      cy.get('[data-cy="crud-table"], table').should('have.attr', 'role');
      cy.get('button').each(($btn) => {
        cy.wrap($btn).then(($el) => {
          const hasAriaLabel = $el.attr('aria-label');
          const hasText = $el.text().trim();
          expect(hasAriaLabel || hasText).to.not.be.empty;
        });
      });
    });
  });

  describe('Performance Tests', () => {
    it('should load page quickly', { tags: ['@performance'] }, () => {
      const startTime = Date.now();
      
      crudPage.visit();
      
      cy.then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(3000); // Page should load within 3 seconds
      });
    });

    it('should handle large datasets efficiently', { tags: ['@performance', '@data'] }, () => {
      // This test would need to be configured based on your application
      // For example, you might create 100+ records and test table performance
      cy.log('Performance test for large datasets - implement based on your needs');
    });
  });
});
