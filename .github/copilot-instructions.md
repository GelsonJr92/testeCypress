# GitHub Copilot Instructions for Cypress Testing Framework

This workspace contains a comprehensive Cypress testing automation framework for CRUD operations. Here are the key patterns and conventions to follow when working with this codebase:

## Framework Architecture

### File Structure
- `/cypress/e2e/` - End-to-end test specifications
- `/cypress/support/` - Reusable commands, utilities, and page objects
- `/cypress/fixtures/` - Test data files
- `/cypress/support/pages/` - Page Object Model classes
- `/cypress/support/utils/` - Utility classes for data generation and API testing

### Naming Conventions
- Test files: `*.cy.ts` (e.g., `crud-frontend.cy.ts`)
- Page objects: `*Page.ts` (e.g., `CrudPage.ts`)
- Utilities: `*Utils.ts` (e.g., `ApiUtils.ts`)
- Commands: `*-commands.ts` (e.g., `api-commands.ts`)

## Key Patterns

### Page Object Model
Always use the inheritance-based page object pattern:
```typescript
class SpecificPage extends BasePage {
  // Inherit common functionality from BasePage
  // Override selectors and add specific methods
}
```

### Custom Commands
Commands are organized by domain:
- `commands.ts` - Frontend CRUD operations
- `api-commands.ts` - Backend API operations
- All commands have proper TypeScript definitions in `index.d.ts`

### Data Generation
Use the `DataFactory` class for generating realistic test data:
```typescript
const userData = DataFactory.generateUser();
const productData = DataFactory.generateProduct();
```

### API Testing
Use the `ApiUtils` class for comprehensive API testing:
```typescript
ApiUtils.runCrudTestSuite('users', '/api/users');
```

## Best Practices

### Test Organization
- Group tests by functionality using `describe` blocks
- Use descriptive test names that explain the expected behavior
- Tag tests with `@smoke`, `@regression`, `@api`, etc.

### Selectors
- Prefer `data-testid` attributes for element selection
- Use page object methods instead of direct selectors in tests
- Override selectors in page objects for different applications

### Error Handling
- All custom commands include proper error handling
- Tests should verify both success and failure scenarios
- Use `cy.intercept()` for API mocking when needed

### Data Management
- Use fixtures for static test data
- Use DataFactory for dynamic/random test data
- Clean up test data after each test run

## Framework Features

### Reporting
- Mochawesome HTML reports with screenshots
- Multi-reporter setup for different output formats
- Automatic screenshot capture on failures

### TypeScript Support
- Full TypeScript integration with proper type definitions
- Path mapping for cleaner imports
- Strict type checking enabled

### Cross-Browser Testing
- Configured for Chrome, Firefox, and Edge
- Responsive design testing with multiple viewports
- Mobile device emulation support

### Performance Testing
- Built-in performance assertions
- Network request monitoring
- Page load time validation

### Accessibility Testing
- WCAG 2.1 AA compliance checking
- Axe-core integration for automated accessibility testing
- Color contrast and keyboard navigation validation

## Environment Configuration

### URLs and Endpoints
- Configure base URLs in `cypress.config.ts`
- Use environment variables for different environments
- API endpoints should be configurable per environment

### Authentication
- Support for token-based authentication
- Automatic token refresh handling
- Role-based testing support

## Debugging and Maintenance

### Common Issues
- Always check network tab for API failures
- Use `cy.debug()` and `cy.pause()` for debugging
- Verify element selectors are not changing

### Test Maintenance
- Keep page objects updated when UI changes
- Update test data when business rules change
- Regularly review and update selectors

### Performance
- Use `cy.intercept()` to control network requests
- Implement proper waits instead of `cy.wait()`
- Clean up resources after tests

## Integration

### CI/CD
- GitHub Actions workflow configured
- Parallel test execution support
- Automatic report generation and artifact upload

### Development Workflow
- Use VS Code tasks for common operations
- Leverage TypeScript for better IDE support
- Follow conventional commit messages

Remember to maintain the generic and reusable nature of this framework when making changes. Any modifications should be applicable across different CRUD applications without requiring major refactoring.
