import { BasePage } from './BasePage';

/**
 * Generic CRUD Page Object
 * Provides reusable CRUD operations for any entity
 */
export class CrudPage extends BasePage {
  // Selectors - can be overridden in derived classes
  protected selectors = {
    // Form selectors
    form: '[data-cy="crud-form"], .crud-form, form',
    submitBtn: '[data-cy="submit"], .btn-submit, button[type="submit"]',
    cancelBtn: '[data-cy="cancel"], .btn-cancel, .cancel-btn',
    
    // Table selectors
    table: '[data-cy="crud-table"], .crud-table, table',
    tableRow: 'tr',
    tableBody: 'tbody',
    
    // Action buttons
    addBtn: '[data-cy="add"], .btn-add, .add-btn',
    editBtn: '[data-cy="edit"], .btn-edit, .edit-btn',
    deleteBtn: '[data-cy="delete"], .btn-delete, .delete-btn',
    viewBtn: '[data-cy="view"], .btn-view, .view-btn',
    
    // Search and pagination
    searchInput: '[data-cy="search"], [placeholder*="search"], [placeholder*="Search"]',
    pagination: '[data-cy="pagination"], .pagination',
    
    // Modal/Dialog
    modal: '[data-cy="modal"], .modal, .dialog',
    confirmBtn: '[data-cy="confirm"], .btn-confirm, .confirm-btn',
    
    // Messages
    successMessage: '[data-cy="success"], .alert-success, .success-message',
    errorMessage: '[data-cy="error"], .alert-error, .error-message',
    
    // Loading
    loading: '[data-cy="loading"], .loading, .spinner'
  };

  constructor(url: string = '/crud') {
    super(url);
  }

  // ===============================================
  // CREATE OPERATIONS
  // ===============================================

  /**
   * Click the Add/Create button
   */
  clickAdd(): void {
    cy.get(this.selectors.addBtn).first().click();
    this.waitForFormLoad();
  }

  /**
   * Fill the form with data
   * @param data - Object containing form data
   */
  fillForm(data: Record<string, any>): void {
    cy.get(this.selectors.form).within(() => {
      Object.keys(data).forEach(field => {
        const value = data[field];
        if (value !== null && value !== undefined && value !== '') {
          // Try multiple selector patterns
          cy.get(`[data-cy="${field}"], [name="${field}"], #${field}, .${field}`)
            .first()
            .then(($el) => {
              if ($el.is('select')) {
                cy.wrap($el).select(value.toString());
              } else if ($el.is('input[type="checkbox"]')) {
                if (value) cy.wrap($el).check();
                else cy.wrap($el).uncheck();
              } else if ($el.is('input[type="radio"]')) {
                cy.wrap($el).check();
              } else {
                cy.wrap($el).clear().type(value.toString());
              }
            });
        }
      });
    });
  }

  /**
   * Submit the form
   */
  submitForm(): void {
    cy.get(this.selectors.submitBtn).click();
    this.waitForOperation();
  }

  /**
   * Cancel form submission
   */
  cancelForm(): void {
    cy.get(this.selectors.cancelBtn).click();
  }

  /**
   * Create a new record (full flow)
   * @param data - Record data
   */
  createRecord(data: Record<string, any>): void {
    this.clickAdd();
    this.fillForm(data);
    this.submitForm();
    this.verifySuccessMessage();
  }

  // ===============================================
  // READ OPERATIONS
  // ===============================================

  /**
   * Verify table contains data
   * @param data - Data to verify
   */
  verifyTableContains(data: Record<string, any>): void {
    cy.get(this.selectors.table).within(() => {
      Object.values(data).forEach(value => {
        if (value !== null && value !== undefined && value !== '') {
          cy.contains(value.toString()).should('be.visible');
        }
      });
    });
  }

  /**
   * Get table row count
   */
  getTableRowCount(): Cypress.Chainable<number> {
    return cy.get(`${this.selectors.table} ${this.selectors.tableBody} ${this.selectors.tableRow}`)
      .its('length');
  }

  /**
   * Get table data from specific row
   * @param rowIndex - Row index (0-based)
   */
  getRowData(rowIndex: number): Cypress.Chainable<string[]> {
    return cy.get(`${this.selectors.table} ${this.selectors.tableBody} ${this.selectors.tableRow}`)
      .eq(rowIndex)
      .find('td')
      .then(($cells) => {
        return Array.from($cells).map(cell => cell.textContent?.trim() || '');
      });
  }

  /**
   * Search for records
   * @param searchTerm - Term to search
   */
  search(searchTerm: string): void {
    cy.get(this.selectors.searchInput).clear().type(searchTerm);
    this.waitForOperation();
  }

  /**
   * Clear search
   */
  clearSearch(): void {
    cy.get(this.selectors.searchInput).clear();
    this.waitForOperation();
  }

  // ===============================================
  // UPDATE OPERATIONS
  // ===============================================

  /**
   * Click edit button for specific row
   * @param identifier - Row identifier (text that appears in the row)
   */
  clickEditForRow(identifier: string): void {
    cy.contains(this.selectors.tableRow, identifier)
      .find(this.selectors.editBtn)
      .click();
    this.waitForFormLoad();
  }

  /**
   * Edit a record (full flow)
   * @param identifier - Row identifier
   * @param newData - Updated data
   */
  editRecord(identifier: string, newData: Record<string, any>): void {
    this.clickEditForRow(identifier);
    this.fillForm(newData);
    this.submitForm();
    this.verifySuccessMessage();
  }

  // ===============================================
  // DELETE OPERATIONS
  // ===============================================

  /**
   * Click delete button for specific row
   * @param identifier - Row identifier
   */
  clickDeleteForRow(identifier: string): void {
    cy.contains(this.selectors.tableRow, identifier)
      .find(this.selectors.deleteBtn)
      .click();
  }

  /**
   * Confirm deletion in modal
   */
  confirmDelete(): void {
    cy.get(this.selectors.modal).should('be.visible');
    cy.get(this.selectors.confirmBtn).click();
    this.waitForOperation();
  }

  /**
   * Delete a record (full flow)
   * @param identifier - Row identifier
   */
  deleteRecord(identifier: string): void {
    this.clickDeleteForRow(identifier);
    this.confirmDelete();
    this.verifySuccessMessage();
  }

  /**
   * Verify record is deleted
   * @param identifier - Row identifier
   */
  verifyRecordDeleted(identifier: string): void {
    cy.get(this.selectors.table).should('not.contain', identifier);
  }

  // ===============================================
  // PAGINATION OPERATIONS
  // ===============================================

  /**
   * Go to specific page
   * @param pageNumber - Page number
   */
  goToPage(pageNumber: number): void {
    cy.get(this.selectors.pagination)
      .find(`[data-page="${pageNumber}"], [aria-label="Page ${pageNumber}"]`)
      .click();
    this.waitForOperation();
  }

  /**
   * Go to next page
   */
  goToNextPage(): void {
    cy.get(this.selectors.pagination)
      .find('[data-cy="next"], .next, [aria-label="Next"]')
      .click();
    this.waitForOperation();
  }

  /**
   * Go to previous page
   */
  goToPreviousPage(): void {
    cy.get(this.selectors.pagination)
      .find('[data-cy="prev"], .prev, [aria-label="Previous"]')
      .click();
    this.waitForOperation();
  }

  // ===============================================
  // VERIFICATION METHODS
  // ===============================================

  /**
   * Verify success message appears
   */
  verifySuccessMessage(): void {
    cy.get(this.selectors.successMessage)
      .should('be.visible');
  }

  /**
   * Verify error message appears
   */
  verifyErrorMessage(): void {
    cy.get(this.selectors.errorMessage)
      .should('be.visible');
  }
  /**
   * Verify table is empty
   */
  verifyTableEmpty(): void {
    cy.get(this.selectors.table).then(($table) => {
      if ($table.text().includes('No data available') || $table.find(this.selectors.tableRow).length === 0) {
        cy.wrap($table).should('be.visible');
      }
    });
  }

  // ===============================================
  // UTILITY METHODS
  // ===============================================

  /**
   * Wait for form to load
   */
  private waitForFormLoad(): void {
    cy.get(this.selectors.form).should('be.visible');
    cy.get(this.selectors.loading).should('not.exist');
  }

  /**
   * Wait for operation to complete
   */
  private waitForOperation(): void {
    cy.get(this.selectors.loading).should('not.exist');
    // Wait a bit for any animations or updates
    cy.wait(500);
  }

  /**
   * Override selectors for specific implementations
   * @param customSelectors - Custom selector overrides
   */
  setSelectors(customSelectors: Partial<typeof this.selectors>): void {
    this.selectors = { ...this.selectors, ...customSelectors };
  }
}
