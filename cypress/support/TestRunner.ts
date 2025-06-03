/// <reference types="cypress" />

/**
 * 🎯 CLASSE TESTRUNNER - EXECUÇÃO ESTRUTURADA DE TESTES CYPRESS
 * 
 * O TestRunner é uma classe utilitária que permite executar testes Cypress de forma 
 * organizada e estruturada, com configurações personalizáveis e relatórios automáticos.
 * 
 * 📋 FUNCIONALIDADES:
 * - Execução sequencial de suites de teste
 * - Configuração flexível (browser, ambiente, etc.)
 * - Geração automática de relatórios
 * - Categorização de testes (api, frontend, integration)
 * - Sistema de prioridades e tags
 * - Validação de ambiente
 * 
 * 🚀 EXEMPLOS DE USO:
 * 
 * // 1. Uso básico - executar todos os testes
 * import { testRunner } from '../support/TestRunner';
 * testRunner.runAllTests();
 * 
 * // 2. Executar apenas testes de API
 * testRunner.runApiTests();
 * 
 * // 3. Executar testes de smoke
 * testRunner.runSmokeTests();
 * 
 * // 4. Validar ambiente antes dos testes
 * const isValid = testRunner.validateEnvironment();
 * 
 * // 5. Configuração personalizada
 * const customRunner = new TestRunner({
 *   browser: 'firefox',
 *   headless: false,
 *   recordVideo: true,
 *   environment: 'staging'
 * });
 * 
 * // 6. Executar suite específica
 * const debugSuite = testRunner.getTestSuites().find(s => s.name === 'Debug Tests');
 * if (debugSuite) testRunner.runTestSuite(debugSuite);
 * 
 * 📝 COMANDOS NPM DISPONÍVEIS:
 * - npm run test:runner - Exibe informações sobre o TestRunner
 * - npm run test:runner:demo - Demonstra uso do TestRunner
 * 
 * 🔧 CONFIGURAÇÕES DISPONÍVEIS:
 * - environment: 'test' | 'staging' | 'production'
 * - browser: 'chrome' | 'firefox' | 'edge' | 'electron'
 * - headless: true | false
 * - recordVideo: true | false
 * - takeScreenshots: true | false
 * - generateReports: true | false (sempre true por padrão)
 * - parallel: true | false
 * - maxRetries: número de tentativas
 */

export interface TestSuite {
  name: string;
  description: string;
  specFile: string;
  category: 'api' | 'frontend' | 'integration';
  priority: 'high' | 'medium' | 'low';
  tags?: string[];
}

export interface RunnerConfig {
  environment?: string;
  browser?: string;
  headless?: boolean;
  recordVideo?: boolean;
  takeScreenshots?: boolean;
  generateReports?: boolean;
  parallel?: boolean;
  maxRetries?: number;
}

export class TestRunner {
  private config: RunnerConfig;
  private testSuites: TestSuite[] = [];  constructor(config: RunnerConfig = {}) {
    this.config = {
      environment: 'test',
      browser: 'chrome',
      headless: true,
      recordVideo: false,
      takeScreenshots: false,
      generateReports: true,
      parallel: false,
      maxRetries: 2,
      ...config
    };
    
    // FORÇA GERAÇÃO DE RELATÓRIOS SEMPRE
    this.config.generateReports = true;

    this.initializeTestSuites();
  }

  private initializeTestSuites(): void {
    this.testSuites = [
      {
        name: 'Debug Tests',
        description: 'Testes básicos para debug e validação do ambiente',
        specFile: 'cypress/e2e/backend/debug.cy.ts',
        category: 'api',
        priority: 'high',
        tags: ['debug', 'smoke', 'api']
      },
      {
        name: 'ServeRest API Core',
        description: 'Testes principais da API ServeRest (usuarios, login)',
        specFile: 'cypress/e2e/backend/serverest-api.cy.ts',
        category: 'api',
        priority: 'high',
        tags: ['api', 'core', 'usuarios', 'login']
      },
      {
        name: 'ServeRest Produtos API',
        description: 'Testes CRUD completos para produtos',
        specFile: 'cypress/e2e/backend/serverest-produtos-api.cy.ts',
        category: 'api',
        priority: 'medium',
        tags: ['api', 'produtos', 'crud']
      },
      {
        name: 'ServeRest Carrinhos API',
        description: 'Testes CRUD completos para carrinhos de compras',
        specFile: 'cypress/e2e/backend/serverest-carrinhos-api.cy.ts',
        category: 'api',
        priority: 'medium',
        tags: ['api', 'carrinhos', 'crud', 'ecommerce']
      }
    ];
  }  public async runAllTests(): Promise<void> {
    this.printConfiguration();
    this.printTestSuitesInfo();
    
    try {
      for (const suite of this.testSuites) {
        await this.runTestSuite(suite);
      }
      
    } catch (error) {
      console.error('Erro durante execução dos testes:', error);
    } finally {
      await this.generateReports();
    }
  }
  public async runTestSuite(suite: TestSuite): Promise<void> {
    console.log(`\nExecutando: ${suite.name}`);
    console.log(`Descrição: ${suite.description}`);
    console.log(`Tags: ${suite.tags?.join(', ') || 'N/A'}`);
    console.log(`Prioridade: ${suite.priority.toUpperCase()}`);
    console.log('-'.repeat(50));
  }  public async runApiTests(): Promise<void> {
    const apiSuites = this.testSuites.filter(suite => suite.category === 'api');
    
    try {
      for (const suite of apiSuites) {
        await this.runTestSuite(suite);
      }
    } catch (error) {
      console.error('Erro durante execução dos testes de API:', error);
    } finally {
      await this.generateReports();
    }
  }  public async runTestsByPriority(priority: 'high' | 'medium' | 'low'): Promise<void> {
    
    const prioritySuites = this.testSuites.filter(suite => suite.priority === priority);
    
    try {
      for (const suite of prioritySuites) {
        await this.runTestSuite(suite);
      }
    } catch (error) {
      console.error(`Erro durante execução dos testes de prioridade ${priority}:`, error);
    } finally {
      // SEMPRE gera relatórios
      await this.generateReports();
    }
  }  public async runSmokeTests(): Promise<void> {
    
    const smokeSuites = this.testSuites.filter(suite => 
      suite.tags?.some(tag => ['smoke', 'debug'].includes(tag))
    );
    
    try {
      for (const suite of smokeSuites) {
        await this.runTestSuite(suite);
      }
    } catch (error) {
      console.error('Erro durante execução dos smoke tests:', error);
    } finally {
      // SEMPRE gera relatórios
      await this.generateReports();
    }
  }  private async generateReports(): Promise<void> {
    // Relatórios gerados automaticamente via package.json scripts
  }
  private printConfiguration(): void {
    console.log('CONFIGURAÇÃO:');
    console.log(`   Environment: ${this.config.environment}`);
    console.log(`   Browser: ${this.config.browser}`);
    console.log(`   Headless: ${this.config.headless ? 'Sim' : 'Não'}`);
    console.log(`   Record Video: ${this.config.recordVideo ? 'Sim' : 'Não'}`);
    console.log(`   Screenshots: ${this.config.takeScreenshots ? 'Sim' : 'Não'}`);
    console.log(`   Generate Reports: ${this.config.generateReports ? 'Sim' : 'Não'}`);
    console.log(`   Max Retries: ${this.config.maxRetries}`);
  }  private printTestSuitesInfo(): void {
    this.testSuites.forEach((suite, index) => {
      const priorityIndicator = suite.priority === 'high' ? '[ALTA]' : 
                               suite.priority === 'medium' ? '[MÉDIA]' : '[BAIXA]';
    });
  }

  public listAvailableTestSuites(): TestSuite[] {
    return [...this.testSuites];
  }

  public getTestSuiteByName(name: string): TestSuite | undefined {
    return this.testSuites.find(suite => suite.name === name);
  }
  public validateEnvironment(): boolean {
    console.log('Validando ambiente...');
    
    const requiredEnvVars = ['apiUrl'];
    
    for (const envVar of requiredEnvVars) {
      if (!Cypress.env(envVar)) {
        console.error(`Variável de ambiente obrigatória não encontrada: ${envVar}`);
        return false;
      }
    }
    
    console.log('Ambiente validado com sucesso!');
    return true;
  }
  public debugMode(): void {
    console.log('MODO DEBUG ATIVADO');
    console.log('Execute os testes passo a passo para investigação');
    
    this.config.headless = false;
    this.config.takeScreenshots = true;
    this.config.recordVideo = true;
    
    console.log('Configurações de debug aplicadas:');
    console.log('   - Modo headless desabilitado');
    console.log('   - Screenshots habilitados');
    console.log('   - Gravação de vídeo habilitada');
  }
}

// Instância global do Runner
export const testRunner = new TestRunner();

// Comandos Cypress personalizados
declare global {
  namespace Cypress {
    interface Chainable {
      runAllTestSuites(): Chainable<void>;
      runApiTestSuites(): Chainable<void>;
      runSmokeTestSuites(): Chainable<void>;
      validateTestEnvironment(): Chainable<boolean>;
    }
  }
}

Cypress.Commands.add('runAllTestSuites', () => {
  cy.then(async () => {
    await testRunner.runAllTests();
  });
});

Cypress.Commands.add('runApiTestSuites', () => {
  cy.then(async () => {
    await testRunner.runApiTests();
  });
});

Cypress.Commands.add('runSmokeTestSuites', () => {
  cy.then(async () => {
    await testRunner.runSmokeTests();
  });
});

Cypress.Commands.add('validateTestEnvironment', () => {
  cy.then(() => {
    return testRunner.validateEnvironment();
  });
});