import { defineConfig } from 'cypress';
import { ensureDynamicCredentials, readFileIfExists, deleteFile } from './cypress/support/tasks/credentialsTask';

// Load environment variables from .env file
require('dotenv').config();

export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || 'https://serverest.dev',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: Number(process.env.CYPRESS_VIEWPORT_WIDTH) || 1280,
    viewportHeight: Number(process.env.CYPRESS_VIEWPORT_HEIGHT) || 720,
    video: process.env.CYPRESS_VIDEO === 'true',
    screenshotOnRunFailure: process.env.CYPRESS_SCREENSHOT_ON_FAILURE === 'true',
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    fixturesFolder: 'cypress/fixtures',
    defaultCommandTimeout: Number(process.env.DEFAULT_COMMAND_TIMEOUT) || 10000,
    requestTimeout: Number(process.env.REQUEST_TIMEOUT) || 10000,
    responseTimeout: Number(process.env.RESPONSE_TIMEOUT) || 10000,
    pageLoadTimeout: Number(process.env.PAGE_LOAD_TIMEOUT) || 30000,
    
    // Environment variables
    env: {
      apiUrl: process.env.CYPRESS_API_URL || 'https://serverest.dev',
      API_BASE_URL: process.env.CYPRESS_API_URL || 'https://serverest.dev',
      grepTags: process.env.CYPRESS_GREP_TAGS,
      hideCredentials: true,
      USER_EMAIL: process.env.CYPRESS_USER_EMAIL || 'fulano@qa.com',
      USER_PASSWORD: process.env.CYPRESS_USER_PASSWORD || 'teste',
      coverage: process.env.CYPRESS_COVERAGE === 'true'
    },

    // Reporter configuration
    reporter: 'cypress-mochawesome-reporter',
    reporterOptions: {
      reportDir: 'cypress/reports/mochawesome',
      quiet: true,
      overwrite: false,
      html: false,
      json: true
    },

    setupNodeEvents(on, config) {
      // Task plugins
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        ensureDynamicCredentials,
        readFileIfExists,
        deleteFile
      });

      // Grep plugin for test filtering
      require('@cypress/grep/src/plugin')(config);
      
      // Plugin para automação de relatórios
      require('./cypress/plugins/report-automation')(on, config);
      
      // Plugin para métricas avançadas
      const AdvancedMetrics = require('./cypress/plugins/advanced-metrics');
      AdvancedMetrics.setupAdvancedMetrics(on, config);
      
      // Hook personalizado para SEMPRE gerar relatórios após execução
      on('after:run', (results) => {
        console.log('Execução finalizada. Processando métricas e gerando relatórios...');
        
        try {
          AdvancedMetrics.finalizeMetrics(results, config.projectRoot);
          console.log('Métricas finalizadas com sucesso');
        } catch (error) {
          console.log('Aviso: Erro ao finalizar métricas:', error.message);
        }
        
        setTimeout(() => {
          const { exec } = require('child_process');
          
          exec('npm run report:create', (error, stdout, stderr) => {
            if (error) {
              console.log('Aviso: Erro ao gerar relatórios automaticamente:', error.message);
            } else {
              console.log('Relatórios gerados automaticamente com sucesso!');
              console.log('- Relatório padrão: cypress/reports/relatorio-padrao.html');
              console.log('- Relatório avançado: cypress/reports/advanced-report.html');
            }
          });
        }, 1000);
      });
      
      return config;
    },

    // Retry configuration
    retries: {
      runMode: 2,
      openMode: 0
    }
  }
});
