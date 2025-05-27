import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    fixturesFolder: 'cypress/fixtures',
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    
    // Environment variables
    env: {
      apiUrl: 'http://localhost:8080/api',
      coverage: false
    },

    // Reporter configuration
    reporter: 'cypress-multi-reporters',
    reporterOptions: {
      configFile: 'reporter-config.json'
    },

    setupNodeEvents(on, config) {
      // Task plugins
      on('task', {
        log(message) {
          console.log(message);
          return null;
        }
      });

      // Grep plugin for test filtering
      require('@cypress/grep/src/plugin')(config);
      
      return config;
    },

    // Retry configuration
    retries: {
      runMode: 2,
      openMode: 0
    },

    // Experimental features
    experimentalStudio: true,
    experimentalMemoryManagement: true
  },

  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.ts'
  }
});
