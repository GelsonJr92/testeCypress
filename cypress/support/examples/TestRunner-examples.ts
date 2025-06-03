/// <reference types="cypress" />

/**
 * 🎯 EXEMPLOS PRÁTICOS DE USO DO TESTRUNNER
 * 
 * Este arquivo contém exemplos reais de como utilizar a classe TestRunner
 * para executar testes de forma estruturada e organizada.
 */

import { TestRunner, testRunner } from '../TestRunner';

/**
 * 📋 EXEMPLO 1: Execução básica de todos os testes
 */
export function exemploBasico() {
  // Usar a instância global já configurada
  testRunner.runAllTests();
}

/**
 * 📋 EXEMPLO 2: Execução apenas de testes de API
 */
export function exemploApiTests() {
  testRunner.runApiTests();
}

/**
 * 📋 EXEMPLO 3: Execução de testes de smoke
 */
export function exemploSmokeTests() {
  testRunner.runSmokeTests();
}

/**
 * 📋 EXEMPLO 4: Configuração personalizada
 */
export function exemploConfiguracaoPersonalizada() {
  const customRunner = new TestRunner({
    browser: 'firefox',
    headless: false,
    recordVideo: true,
    takeScreenshots: true,
    environment: 'staging',
    maxRetries: 3
  });
  
  customRunner.runAllTests();
}

/**
 * 📋 EXEMPLO 5: Executar suite específica
 */
export function exemploSuiteEspecifica() {
  const suites = testRunner.listAvailableTestSuites();
  const debugSuite = suites.find(s => s.name === 'Debug Tests');
  
  if (debugSuite) {
    testRunner.runTestSuite(debugSuite);
  }
}

/**
 * 📋 EXEMPLO 6: Validação de ambiente antes da execução
 */
export function exemploValidacaoAmbiente() {
  const isEnvironmentValid = testRunner.validateEnvironment();
  
  if (isEnvironmentValid) {
    console.log('✅ Ambiente válido! Prosseguindo com os testes...');
    testRunner.runApiTests();
  } else {
    console.error('❌ Ambiente inválido! Verifique as configurações.');
  }
}

/**
 * 📋 EXEMPLO 7: Modo debug para investigação
 */
export function exemploModoDebug() {
  testRunner.debugMode(); // Configura para modo debug
  
  // Executar teste específico em modo debug
  const debugSuite = testRunner.getTestSuiteByName('Debug Tests');
  if (debugSuite) {
    testRunner.runTestSuite(debugSuite);
  }
}

/**
 * 📋 EXEMPLO 8: Usando comandos Cypress personalizados
 * 
 * Estes comandos podem ser usados dentro de arquivos .cy.ts
 */
export function exemploComandosCypress() {
  // Dentro de um arquivo de teste .cy.ts:
  
  describe('Exemplo com TestRunner', () => {
    it('Deve validar ambiente', () => {
      cy.validateTestEnvironment().then((isValid) => {
        expect(isValid).to.be.true;
      });
    });
    
    it('Deve executar testes de API', () => {
      cy.runApiTestSuites();
    });
    
    it('Deve executar testes de smoke', () => {
      cy.runSmokeTestSuites();
    });
  });
}

/**
 * 📋 EXEMPLO 9: Listagem e filtros de suites
 */
export function exemploListagemSuites() {
  const todasSuites = testRunner.listAvailableTestSuites();
  
  // Filtrar por categoria
  const apiSuites = todasSuites.filter(s => s.category === 'api');
  const highPrioritySuites = todasSuites.filter(s => s.priority === 'high');
  const suitesComTagSmoke = todasSuites.filter(s => s.tags?.includes('smoke'));
  
  console.log('📊 Estatísticas das Suites:');
  console.log(`   Total: ${todasSuites.length}`);
  console.log(`   API: ${apiSuites.length}`);
  console.log(`   Alta Prioridade: ${highPrioritySuites.length}`);
  console.log(`   Com tag 'smoke': ${suitesComTagSmoke.length}`);
  
  // Executar apenas suites de alta prioridade
  for (const suite of highPrioritySuites) {
    testRunner.runTestSuite(suite);
  }
}

/**
 * 📋 EXEMPLO 10: Integração com pipeline CI/CD
 */
export function exemploCI_CD() {
  // Configuração otimizada para CI/CD
  const ciRunner = new TestRunner({
    headless: true,
    recordVideo: false,
    takeScreenshots: true, // Apenas em caso de falha
    generateReports: true,
    environment: process.env.NODE_ENV || 'test',
    maxRetries: 1 // Reduzir tentativas no CI
  });
  
  // Executar testes baseado na branch/ambiente
  const environment = process.env.NODE_ENV;
  
  if (environment === 'production') {
    ciRunner.runSmokeTests(); // Apenas smoke tests em produção
  } else {
    ciRunner.runAllTests(); // Todos os testes em staging/dev
  }
}
