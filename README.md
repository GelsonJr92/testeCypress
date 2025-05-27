# Comprehensive Cypress Testing Framework

[![Cypress Tests](https://github.com/SEU_USUARIO/SEU_REPO/actions/workflows/cypress.yml/badge.svg)](https://github.com/SEU_USUARIO/SEU_REPO/actions/workflows/cypress.yml)

A production-ready Cypress testing automation framework for CRUD operations with TypeScript, advanced reporting, and modern best practices.

## 🚀 Features

- **Complete CRUD Testing** - Frontend and Backend API test suites
- **TypeScript Support** - Full type safety with custom command definitions
- **Page Object Model** - Inheritance-based, reusable page objects
- **Advanced Reporting** - Mochawesome HTML reports with screenshots
- **Data Generation** - Faker.js powered realistic test data
- **Custom Commands** - Domain-specific commands for efficient testing
- **Cross-Browser Testing** - Chrome, Firefox, Edge support
- **Performance Testing** - Built-in performance assertions
- **Accessibility Testing** - WCAG 2.1 AA compliance checking
- **CI/CD Ready** - GitHub Actions workflow included
- **Generic & Reusable** - Framework adapts to any CRUD application

## 📁 Project Structure

```
cypress/
├── e2e/
│   ├── frontend/           # Frontend CRUD tests
│   │   └── crud-frontend.cy.ts
│   └── backend/            # API CRUD tests
│       └── crud-api.cy.ts
├── fixtures/               # Test data files
│   ├── users.json
│   ├── products.json
│   └── config.json
├── support/
│   ├── pages/              # Page Object Model
│   │   ├── BasePage.ts
│   │   └── CrudPage.ts
│   ├── utils/              # Utility classes
│   │   ├── DataFactory.ts
│   │   └── ApiUtils.ts
│   ├── commands.ts         # Frontend custom commands
│   ├── api-commands.ts     # API custom commands
│   ├── e2e.ts             # Global configuration
│   ├── component.ts       # Component test setup
│   └── index.d.ts         # TypeScript definitions
├── cypress.config.ts       # Main Cypress configuration
├── tsconfig.json          # TypeScript configuration
└── reporter-config.json   # Report configuration
```

## 🛠️ Installation

1. **Clone or download the framework**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Install Cypress binary:**
   ```bash
   npm run install:cypress
   ```
4. **Verify installation:**
   ```bash
   npm run verify:cypress
   ```

## 🎯 Quick Start

### Running Tests

```bash
# Open Cypress Test Runner
npm run cy:open

# Run all tests headlessly
npm run cy:run

# Run specific test suites
npm run cy:run:frontend    # Frontend tests only
npm run cy:run:api         # API tests only
npm run cy:run:component   # Component tests only

# Run tests by tags
npm run cy:run:smoke       # Smoke tests only
npm run cy:run:regression  # Regression tests only

# Cross-browser testing
npm run cy:run:chrome
npm run cy:run:firefox
npm run cy:run:edge
```

### Generating Reports

```bash
# Merge and generate HTML reports
npm run report:merge
npm run report:generate
npm run report:open
```

## 🔧 Configuration

### Environment Setup

1. **Configure your application URLs in `cypress.config.ts`:**
   ```typescript
   export default defineConfig({
     e2e: {
       baseUrl: 'http://localhost:3000',  // Your app URL
       env: {
         apiUrl: 'http://localhost:3000/api'  // Your API URL
       }
     }
   })
   ```

2. **Update selectors in your page objects** if needed:
   ```typescript
   class YourAppPage extends CrudPage {
     protected selectors = {
       ...this.selectors,
       // Override selectors for your specific application
       addButton: '[data-testid="your-add-btn"]'
     }
   }
   ```

### Test Data Configuration

- **Static data**: Edit files in `cypress/fixtures/`
- **Dynamic data**: Use `DataFactory` class methods
- **Configuration**: Update `cypress/fixtures/config.json`

## 📝 Writing Tests

### Frontend Tests Example

```typescript
import { CrudPage } from '@support/pages/CrudPage'
import { DataFactory } from '@support/utils/DataFactory'

describe('User Management', { tags: ['@smoke', '@frontend'] }, () => {
  const crudPage = new CrudPage('/users')
  
  it('should create a new user', () => {
    const userData = DataFactory.generateUser()
    
    cy.visit('/users')
    cy.createRecord(userData)
    cy.verifyRecordExists(userData.name)
  })
})
```

### API Tests Example

```typescript
import { ApiUtils } from '@support/utils/ApiUtils'

describe('Users API', { tags: ['@api', '@regression'] }, () => {
  it('should run complete CRUD test suite', () => {
    ApiUtils.runCrudTestSuite('users', '/api/users')
  })
})
```

### Custom Commands Usage

```typescript
// Frontend commands
cy.fillForm(formData)
cy.submitForm()
cy.verifyNotification('success')
cy.searchInTable('John Doe')

// API commands
cy.apiLogin(credentials)
cy.apiCreate('/api/users', userData)
cy.apiGet('/api/users/1')
cy.apiUpdate('/api/users/1', updateData)
cy.apiDelete('/api/users/1')
```

## 🧪 Test Categories

### Smoke Tests (`@smoke`)
- Critical user journeys
- Basic CRUD operations
- Authentication flows

### Regression Tests (`@regression`)
- Comprehensive feature testing
- Edge cases and error scenarios
- Performance validations

### API Tests (`@api`)
- RESTful API endpoints
- Authentication and authorization
- Data validation and error handling

### Accessibility Tests (`@a11y`)
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader compatibility

## 🎨 Page Object Model

### BasePage
- Common functionality across all pages
- Navigation helpers
- Screenshot utilities
- Element waiting methods

### CrudPage
- Generic CRUD operations
- Form handling
- Table interactions
- Modal management
- Pagination support

### Custom Pages
```typescript
class UserPage extends CrudPage {
  constructor() {
    super('/users')
  }
  
  // Add user-specific methods
  assignRole(userId: string, role: string) {
    // Implementation
  }
}
```

## 🔍 Utilities

### DataFactory
Generates realistic test data using Faker.js:
- `generateUser()` - User profiles
- `generateProduct()` - Product information
- `generateCompany()` - Company details
- `generateOrder()` - Order data

### ApiUtils
Comprehensive API testing utilities:
- `runCrudTestSuite()` - Complete CRUD test automation
- `testPerformance()` - Response time validation
- `testSecurity()` - Security scenario testing
- `testDataValidation()` - Schema validation

## 📊 Reporting

The framework generates comprehensive HTML reports with:
- Test execution summary
- Screenshots on failures
- Performance metrics
- Accessibility scan results
- Error details and stack traces

Reports are generated in the `cypress/reports/` directory.

## 🚀 CI/CD Integration

### GitHub Actions
The included workflow provides:
- Multi-browser testing (Chrome, Firefox, Edge)
- Parallel test execution
- Automatic report generation
- PR comment with test results
- Artifact uploads for failures

### Setup
1. Enable GitHub Actions in your repository
2. Add secrets for Cypress Dashboard (optional):
   - `CYPRESS_RECORD_KEY`
   - `CYPRESS_PROJECT_ID`

## 🛠️ Development

### Adding New Tests
1. Create test files in appropriate directories
2. Use existing page objects or extend them
3. Tag tests appropriately
4. Follow naming conventions

### Extending Page Objects
```typescript
class CustomPage extends BasePage {
  constructor(path: string) {
    super(path)
  }
  
  // Add custom methods
}
```

### Creating Custom Commands
1. Add command implementation in `commands.ts` or `api-commands.ts`
2. Add TypeScript definition in `index.d.ts`
3. Import in test files as needed

## 🔧 Troubleshooting

### Common Issues

**Tests failing intermittently:**
- Check for race conditions
- Add proper waits instead of `cy.wait()`
- Verify element selectors

**API tests failing:**
- Verify API server is running
- Check authentication tokens
- Validate request/response formats

**Performance issues:**
- Use `cy.intercept()` to mock slow requests
- Optimize test data setup
- Run tests with `--headless` flag

### Debug Commands
```bash
# Get Cypress info
npm run info:cypress

# Clear Cypress cache
npm run clean:cache

# Clean test artifacts
npm run clean:reports
```

## 📚 Best Practices

### Test Design
- Keep tests independent and isolated
- Use meaningful test descriptions
- Tag tests for easy categorization
- Clean up test data after execution

### Page Objects
- Use inheritance for common functionality
- Override selectors for different applications
- Keep methods focused and reusable
- Document complex interactions

### Data Management
- Use fixtures for static, predictable data
- Use DataFactory for dynamic, realistic data
- Avoid hardcoded values in tests
- Clean up created data

### Performance
- Use intercepts instead of waits
- Implement proper retry logic
- Monitor test execution times
- Optimize CI/CD pipeline

## 🤝 Contributing

1. Follow existing code patterns
2. Add TypeScript types for new features
3. Include tests for new functionality
4. Update documentation as needed
5. Maintain framework's generic nature

## 📄 License

This framework is provided as-is for educational and development purposes. Adapt and modify as needed for your projects.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review Cypress documentation
3. Examine existing test examples
4. Verify configuration settings

---

**Happy Testing! 🎉**
