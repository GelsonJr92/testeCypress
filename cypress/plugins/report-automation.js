const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const HtmlReportGenerator = require('./html-report-generator');
const AdvancedMetrics = require('./advanced-metrics');

/**
 * Plugin para automatizar a geração de relatórios após os testes
 */
function setupReportAutomation(on, config) {  // Evento disparado após todos os testes terminarem
  on('after:run', (results) => {
    console.log('Iniciando geração automática do relatório...');
    
    try {
      // Verificar se existem arquivos JSON para merge
      const reportsDir = path.join(config.projectRoot, 'cypress', 'reports', 'mochawesome');
      const jsonFiles = fs.readdirSync(reportsDir).filter(file => file.endsWith('.json'));
      
      if (jsonFiles.length === 0) {
        console.log('AVISO: Nenhum arquivo de relatório encontrado para merge');
        return;
      }

      console.log(`Encontrados ${jsonFiles.length} arquivos de relatório`);

      // 1. Fazer merge dos arquivos JSON
      console.log('Fazendo merge dos relatórios...');
      execSync('npx mochawesome-merge cypress/reports/mochawesome/*.json -o cypress/reports/merged.json', {
        cwd: config.projectRoot,
        stdio: 'inherit'
      });      // 2. Gerar relatório HTML padrão
      console.log('Gerando relatório HTML padrão...');
      execSync('npx marge cypress/reports/merged.json --reportDir cypress/reports --inline', {
        cwd: config.projectRoot,
        stdio: 'inherit'
      });      // 3. Gerar relatório HTML avançado interativo
      console.log('Gerando relatório HTML avançado...');
      
      const mergedJsonPath = path.join(config.projectRoot, 'cypress', 'reports', 'merged.json');
      const advancedReportsDir = path.join(config.projectRoot, 'cypress', 'reports');
      
      if (fs.existsSync(mergedJsonPath)) {
        const mergedData = JSON.parse(fs.readFileSync(mergedJsonPath, 'utf8'));
        
        // Gerar análise dos dados
        const analysisData = generateAnalysis(mergedData, results);
          // Gerar relatório HTML avançado
        const htmlPath = HtmlReportGenerator.generateAdvancedHtmlReport(analysisData, mergedData, advancedReportsDir);
        
        console.log(`Relatório HTML avançado criado: ${htmlPath}`);
        
        // Gerar relatório de benchmark
        AdvancedMetrics.generateBenchmarkReport(config.projectRoot);
      }

      // 4. Mostrar estatísticas
      console.log('\nESTATÍSTICAS DOS TESTES:');
      console.log(`Testes executados: ${results.totalTests}`);
      console.log(`Testes passando: ${results.totalPassed}`);
      console.log(`Testes falhando: ${results.totalFailed}`);
      console.log(`Duração: ${Math.round(results.totalDuration / 1000)}s`);      console.log('\nRelatórios gerados com sucesso!');
      console.log(' Relatório padrão: cypress/reports/merged.html');
      console.log('Relatório avançado: cypress/reports/advanced-report.html');
      console.log(' Relatório de benchmark: cypress/reports/benchmark-report.txt');
      
      // 5. Opcional: abrir automaticamente o relatório (comentado por padrão)
      // console.log('Abrindo relatório no navegador...');
      // execSync('start cypress/reports/merged.html', { cwd: config.projectRoot });

    } catch (error) {
      console.error('ERRO ao gerar relatório automático:', error.message);
    }
  });  // Evento disparado antes dos testes iniciarem
  on('before:run', (details) => {
    console.log('Limpando TODOS os relatórios antigos...');
    
    try {
      const reportsDir = path.join(config.projectRoot, 'cypress', 'reports');
      
      // 1. Limpar todos os arquivos JSON do mochawesome
      const mochawesomeDir = path.join(reportsDir, 'mochawesome');
      if (fs.existsSync(mochawesomeDir)) {
        const jsonFiles = fs.readdirSync(mochawesomeDir).filter(file => file.endsWith('.json'));
        jsonFiles.forEach(file => {
          fs.unlinkSync(path.join(mochawesomeDir, file));
        });
        console.log(`Removidos ${jsonFiles.length} arquivos JSON antigos`);
      }
      
      // 2. Limpar arquivos merged antigos
      if (fs.existsSync(path.join(reportsDir, 'merged.json'))) {
        fs.unlinkSync(path.join(reportsDir, 'merged.json'));
        console.log('Removido merged.json antigo');
      }
      
      // 3. Limpar relatórios HTML antigos
      if (fs.existsSync(path.join(reportsDir, 'merged.html'))) {
        fs.unlinkSync(path.join(reportsDir, 'merged.html'));
        console.log('Removido merged.html antigo');
      }
      
      // 4. Limpar diretório HTML se existir
      const htmlDir = path.join(reportsDir, 'html');
      if (fs.existsSync(htmlDir)) {
        fs.rmSync(htmlDir, { recursive: true, force: true });
        console.log('Removido diretório HTML antigo');
      }
      
      // 5. Limpar diretório cypress/reports se existir
      const cypressReportsDir = path.join(reportsDir, 'cypress');
      if (fs.existsSync(cypressReportsDir)) {
        fs.rmSync(cypressReportsDir, { recursive: true, force: true });
        console.log('Removido diretório cypress/reports antigo');
      }
      
      console.log('Limpeza COMPLETA concluída - todos os relatórios antigos removidos');
    } catch (error) {
      console.error('ERRO na limpeza:', error.message);
    }
  });
}

/**
 * Gera análise completa dos dados dos testes
 */
function generateAnalysis(mergedData, results) {
  console.log(' Gerando análise avançada dos testes...');
  
  const analysis = {
    overview: {
      totalTests: results.totalTests || 0,
      totalPassed: results.totalPassed || 0,
      totalFailed: results.totalFailed || 0,
      totalPending: results.totalPending || 0,
      totalSkipped: results.totalSkipped || 0,
      totalDuration: results.totalDuration || 0,
      startedAt: results.startedAt || new Date().toISOString(),
      endedAt: results.endedAt || new Date().toISOString(),
      browser: results.browserName || 'Unknown',
      browserVersion: results.browserVersion || 'Unknown'
    },
    performance: {
      averageTestDuration: 0,
      slowestTest: null,
      fastestTest: null,
      performanceBySpec: []
    },
    specs: [],
    environment: {
      os: require('os').platform(),
      osVersion: require('os').release(),
      nodeVersion: process.version,
      cypressVersion: 'Unknown'
    },
    errors: [],
    charts: {
      statusDistribution: [],
      durationDistribution: [],
      specPerformance: []
    }
  };

  // Analisar specs e testes individuais
  if (mergedData && mergedData.results) {
    let totalDuration = 0;
    let testCount = 0;
    let slowestDuration = 0;
    let fastestDuration = Infinity;

    mergedData.results.forEach(spec => {
      const specAnalysis = {
        title: spec.title,
        file: spec.file,
        fullFile: spec.fullFile,
        duration: spec.duration || 0,
        tests: {
          total: 0,
          passed: 0,
          failed: 0,
          pending: 0,
          skipped: 0
        },
        errors: []
      };

      // Analisar testes dentro do spec
      if (spec.suites) {
        spec.suites.forEach(suite => {
          if (suite.tests) {
            suite.tests.forEach(test => {
              specAnalysis.tests.total++;
              testCount++;
              
              const testDuration = test.duration || 0;
              totalDuration += testDuration;

              if (testDuration > slowestDuration) {
                slowestDuration = testDuration;
                analysis.performance.slowestTest = {
                  title: test.title,
                  duration: testDuration,
                  spec: spec.title
                };
              }

              if (testDuration < fastestDuration && testDuration > 0) {
                fastestDuration = testDuration;
                analysis.performance.fastestTest = {
                  title: test.title,
                  duration: testDuration,
                  spec: spec.title
                };
              }

              switch (test.state) {
                case 'passed':
                  specAnalysis.tests.passed++;
                  break;
                case 'failed':
                  specAnalysis.tests.failed++;
                  if (test.err) {
                    const error = {
                      test: test.title,
                      spec: spec.title,
                      message: test.err.message || 'Unknown error',
                      stack: test.err.stack || ''
                    };
                    specAnalysis.errors.push(error);
                    analysis.errors.push(error);
                  }
                  break;
                case 'pending':
                  specAnalysis.tests.pending++;
                  break;
                case 'skipped':
                  specAnalysis.tests.skipped++;
                  break;
              }
            });
          }
        });
      }

      analysis.specs.push(specAnalysis);
    });

    // Calcular métricas de performance
    analysis.performance.averageTestDuration = testCount > 0 ? totalDuration / testCount : 0;
  }

  // Gerar dados para gráficos
  analysis.charts.statusDistribution = [
    { label: 'Passou', value: analysis.overview.totalPassed, color: '#4CAF50' },
    { label: 'Falhou', value: analysis.overview.totalFailed, color: '#F44336' },
    { label: 'Pendente', value: analysis.overview.totalPending, color: '#FF9800' },
    { label: 'Ignorado', value: analysis.overview.totalSkipped, color: '#9E9E9E' }
  ];

  analysis.charts.specPerformance = analysis.specs.map(spec => ({
    label: path.basename(spec.file || spec.title),
    value: spec.duration,
    color: spec.tests.failed > 0 ? '#F44336' : '#4CAF50'
  }));

  console.log(' Análise avançada gerada com sucesso');
  return analysis;
}

module.exports = setupReportAutomation;

