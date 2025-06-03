const fs = require('fs');
const path = require('path');

/**
 * Gerador de Relatórios HTML Avançados e Interativos
 * Sistema completo com visualizações dinâmicas, filtros e análises detalhadas
 */
class AdvancedHtmlReportGenerator {

  /**
   * Gera relatório HTML completo com interatividade avançada
   */
  static generateAdvancedReport(projectRoot) {
    console.log('Gerando relatório HTML avançado e interativo...');

    try {
      // Carregar dados das métricas
      const metricsPath = path.join(projectRoot, 'cypress', 'reports', 'advanced-metrics.json');
      const analysisPath = path.join(projectRoot, 'cypress', 'reports', 'test-analysis.json');
      
      let metricsData = {};
      let analysisData = {};

      if (fs.existsSync(metricsPath)) {
        metricsData = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
      }
      
      if (fs.existsSync(analysisPath)) {
        analysisData = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));
      }

      // Carregar dados dos testes individuais
      const mochawesomePath = path.join(projectRoot, 'cypress', 'reports', 'mochawesome');
      const testDetails = this.loadTestDetails(mochawesomePath);

      // Carregar dados das respostas das APIs
      const apiResponses = this.loadApiResponses(projectRoot);      // Gerar HTML completo
      const htmlContent = this.generateFullHtml(metricsData, analysisData, testDetails, apiResponses);

      // Garantir que o diretório de relatórios existe
      const reportsDir = path.join(projectRoot, 'cypress', 'reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      // Salvar arquivo
      const outputPath = path.join(reportsDir, 'advanced-report.html');
      fs.writeFileSync(outputPath, htmlContent, 'utf8');console.log('Relatório HTML avançado gerado com sucesso!');
      console.log('Arquivo:', outputPath);
      
      return outputPath;

    } catch (error) {
      console.error('Erro ao gerar relatório HTML:', error);
      return null;
    }
  }
  /**
   * Carrega dados das respostas das APIs
   */
  static loadApiResponses(projectRoot) {
    try {
      const apiResponsesPath = path.join(projectRoot, 'cypress', 'reports', 'api-responses.json');
      if (fs.existsSync(apiResponsesPath)) {
        return JSON.parse(fs.readFileSync(apiResponsesPath, 'utf8'));
      }
    } catch (error) {
      console.warn('Erro ao carregar respostas das APIs:', error.message);
    }
    return [];
  }
  /**
   * Carrega detalhes de todos os testes individuais
   */
  static loadTestDetails(mochawesomePath) {
    const testDetails = {
      specs: [],
      tests: [],
      totalStats: {
        suites: 0,
        tests: 0,
        passes: 0,
        failures: 0,
        pending: 0,
        duration: 0
      }
    };

    try {
      if (!fs.existsSync(mochawesomePath)) {
        console.log(' Pasta mochawesome não encontrada:', mochawesomePath);
        return testDetails;
      }

      const jsonFiles = fs.readdirSync(mochawesomePath)
        .filter(file => file.endsWith('.json'))
        .sort();

      console.log(` Processando ${jsonFiles.length} arquivos JSON...`);

      jsonFiles.forEach(file => {
        try {
          const filePath = path.join(mochawesomePath, file);
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            console.log(`    Processando: ${file}`);
          
          if (data.stats && data.results) {
            // Processar estatísticas
            testDetails.totalStats.suites += data.stats.suites || 0;
            testDetails.totalStats.tests += data.stats.tests || 0;
            testDetails.totalStats.passes += data.stats.passes || 0;
            testDetails.totalStats.failures += data.stats.failures || 0;
            testDetails.totalStats.pending += data.stats.pending || 0;
            testDetails.totalStats.duration += data.stats.duration || 0;

            // Processar spec
            const specInfo = {
              file: file,
              title: data.results[0]?.file || file,
              stats: data.stats,
              results: data.results,
              timestamp: this.extractTimestamp(file)
            };
            
            testDetails.specs.push(specInfo);

            // Extrair testes individuais dos results (não suites)
            data.results.forEach(result => {
              if (result.suites && Array.isArray(result.suites)) {
                this.extractIndividualTests(result.suites, testDetails.tests, specInfo.title);
              }
            });
            
            console.log(`      ${data.stats.tests || 0} testes encontrados`);
          } else {
            console.log(`      Dados inválidos no arquivo: ${file} - faltando stats ou results`);
          }
        } catch (err) {
          console.warn('      Erro ao processar arquivo:', file, err.message);
        }
      });

      console.log(` Total processado: ${testDetails.tests.length} testes de ${testDetails.specs.length} specs`);

    } catch (error) {
      console.warn(' Erro ao carregar detalhes dos testes:', error.message);
    }

    return testDetails;
  }
  /**
   * Extrai testes individuais recursivamente das suites
   */
  static extractIndividualTests(suites, testsArray, specTitle) {
    if (!Array.isArray(suites)) return;

    suites.forEach(suite => {
      if (suite.tests && Array.isArray(suite.tests)) {
        suite.tests.forEach(test => {
          testsArray.push({
            spec: specTitle,
            suite: suite.title,
            title: test.title,
            state: test.state || test.pass ? 'passed' : test.pending ? 'pending' : 'failed',
            duration: test.duration || 0,
            err: test.err,
            code: test.code,
            fullTitle: test.fullTitle || (suite.title + ' ' + test.title)
          });
        });
      }

      // Processar suites aninhadas
      if (suite.suites && Array.isArray(suite.suites)) {
        this.extractIndividualTests(suite.suites, testsArray, specTitle);
      }
    });
  }

  /**
   * Extrai timestamp do nome do arquivo
   */
  static extractTimestamp(filename) {
    const match = filename.match(/(\d{8}_\d{6})/);
    if (match) {
      const timestamp = match[1];
      const date = timestamp.substring(0, 8);
      const time = timestamp.substring(9);
      return date.substring(0, 2) + '/' + date.substring(2, 4) + '/' + date.substring(4) + 
             ' ' + time.substring(0, 2) + ':' + time.substring(2, 4) + ':' + time.substring(4);
    }
    return 'N/A';
  }  /**
   * Gera HTML completo com interatividade avançada
   */  static generateFullHtml(metricsData, analysisData, testDetails, apiResponses) {
    const cssStyles = this.generateAdvancedCSS();
    const jsScripts = this.generateAdvancedJavaScript(testDetails); // Passando testDetails
    const headerSection = this.generateHeaderSection(testDetails.totalStats);
    const dashboardSection = this.generateDashboardSection(metricsData, analysisData, testDetails);    const testsSection = this.generateTestsSection(testDetails, apiResponses);
    const metricsSection = this.generateMetricsSection(metricsData);
    const chartsSection = this.generateChartsSection(testDetails, metricsData);

    return '<!DOCTYPE html>' +
           '<html lang="pt-BR">' +
           '<head>' +
           '<meta charset="UTF-8">' +
           '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
           '<title>Relatório Avançado de Testes Cypress</title>' +           '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">' +
           '<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>' +
           cssStyles +
           '</head>' +
           '<body>' +
           headerSection +
           '<div class="container">' +           dashboardSection +
           testsSection +
           metricsSection +
           chartsSection +
           '</div>\n' +
           jsScripts +
           '</body>\n' +
           '</html>';
  }

  /**
   * Gera CSS avançado e responsivo
   */
  static generateAdvancedCSS() {
    return '<style>' +
           ':root {' +
           '  --primary-color: #2563eb;' +
           '  --secondary-color: #64748b;' +
           '  --success-color: #10b981;' +
           '  --danger-color: #ef4444;' +
           '  --warning-color: #f59e0b;' +
           '  --info-color: #3b82f6;' +
           '  --light-bg: #f8fafc;' +
           '  --card-bg: #ffffff;' +
           '  --border-color: #e2e8f0;' +
           '  --text-primary: #1e293b;' +
           '  --text-secondary: #64748b;' +
           '  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);' +
           '}' +
           '* { margin: 0; padding: 0; box-sizing: border-box; }' +
           'body {' +
           '  font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;' +
           '  background: var(--light-bg);' +
           '  color: var(--text-primary);' +
           '  line-height: 1.6;' +
           '}' +
           '.header {' +
           '  background: linear-gradient(135deg, var(--primary-color), #1d4ed8);' +
           '  color: white;' +
           '  padding: 2rem 0;' +
           '  box-shadow: var(--shadow);' +
           '}' +
           '.header-content {' +
           '  max-width: 1200px;' +
           '  margin: 0 auto;' +
           '  padding: 0 1rem;' +
           '  display: flex;' +
           '  justify-content: space-between;' +
           '  align-items: center;' +
           '  flex-wrap: wrap;' +
           '}' +
           '.header h1 {' +
           '  font-size: 2rem;' +
           '  font-weight: 700;' +
           '  margin-bottom: 0.5rem;' +
           '}' +
           '.header-stats {' +
           '  display: flex;' +
           '  gap: 2rem;' +
           '  flex-wrap: wrap;' +
           '}' +
           '.stat-item {' +
           '  text-align: center;' +
           '}' +
           '.stat-value {' +
           '  font-size: 1.5rem;' +
           '  font-weight: 700;' +
           '  display: block;' +
           '}' +
           '.stat-label {' +
           '  font-size: 0.875rem;' +
           '  opacity: 0.9;' +
           '}' +
           '.container {' +
           '  max-width: 1200px;' +
           '  margin: 0 auto;' +
           '  padding: 2rem 1rem;' +
           '}' +
           '.dashboard {' +
           '  display: grid;' +
           '  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));' +
           '  gap: 1.5rem;' +
           '  margin-bottom: 2rem;' +
           '}' +
           '.card {' +
           '  background: var(--card-bg);' +
           '  border-radius: 12px;' +
           '  padding: 1.5rem;' +
           '  box-shadow: var(--shadow);' +
           '  border: 1px solid var(--border-color);' +
           '  transition: transform 0.2s, box-shadow 0.2s;' +
           '}' +
           '.card:hover {' +
           '  transform: translateY(-2px);' +
           '  box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.15);' +
           '}' +
           '.card-header {' +
           '  display: flex;' +
           '  align-items: center;' +
           '  gap: 0.75rem;' +
           '  margin-bottom: 1rem;' +
           '}' +
           '.card-title {' +
           '  font-size: 1.125rem;' +
           '  font-weight: 600;' +
           '  margin: 0;' +
           '}' +
           '.card-icon {' +
           '  width: 24px;' +
           '  height: 24px;' +
           '  color: var(--primary-color);' +
           '}' +
           '.filters {' +
           '  background: var(--card-bg);' +
           '  border-radius: 12px;' +
           '  padding: 1.5rem;' +
           '  margin-bottom: 2rem;' +
           '  box-shadow: var(--shadow);' +
           '  border: 1px solid var(--border-color);' +
           '}' +
           '.filter-row {' +
           '  display: flex;' +
           '  gap: 1rem;' +
           '  align-items: center;' +
           '  flex-wrap: wrap;' +
           '}' +
           '.filter-group {' +
           '  display: flex;' +
           '  flex-direction: column;' +
           '  gap: 0.5rem;' +
           '}' +
           '.filter-label {' +
           '  font-weight: 500;' +
           '  font-size: 0.875rem;' +
           '  color: var(--text-secondary);' +
           '}' +
           '.filter-input, .filter-select {' +
           '  padding: 0.5rem;' +
           '  border: 1px solid var(--border-color);' +
           '  border-radius: 6px;' +
           '  font-size: 0.875rem;' +
           '  transition: border-color 0.2s;' +
           '}' +
           '.filter-input:focus, .filter-select:focus {' +
           '  outline: none;' +
           '  border-color: var(--primary-color);' +
           '  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);' +
           '}' +
           '.btn {' +
           '  padding: 0.5rem 1rem;' +
           '  border: none;' +
           '  border-radius: 6px;' +
           '  font-size: 0.875rem;' +
           '  font-weight: 500;' +
           '  cursor: pointer;' +
           '  transition: all 0.2s;' +
           '  display: inline-flex;' +
           '  align-items: center;' +
           '  gap: 0.5rem;' +
           '}' +
           '.btn-primary {' +
           '  background: var(--primary-color);' +
           '  color: white;' +
           '}' +
           '.btn-primary:hover {' +
           '  background: #1d4ed8;' +
           '}' +
           '.tests-grid {' +
           '  display: grid;' +
           '  gap: 1rem;' +
           '}' +
           '.test-item {' +
           '  background: var(--card-bg);' +
           '  border-radius: 8px;' +
           '  padding: 1rem;' +
           '  border: 1px solid var(--border-color);' +
           '  cursor: pointer;' +
           '  transition: all 0.2s;' +
           '}' +
           '.test-item:hover {' +
           '  border-color: var(--primary-color);' +
           '  transform: translateX(4px);' +
           '}' +
           '.test-header {' +
           '  display: flex;' +
           '  justify-content: space-between;' +
           '  align-items: flex-start;' +
           '  margin-bottom: 0.5rem;' +
           '}' +
           '.test-title {' +
           '  font-weight: 600;' +
           '  font-size: 0.95rem;' +
           '  color: var(--text-primary);' +
           '}' +
           '.test-status {' +
           '  padding: 0.25rem 0.75rem;' +
           '  border-radius: 20px;' +
           '  font-size: 0.75rem;' +
           '  font-weight: 600;' +
           '  text-transform: uppercase;' +
           '}' +
           '.status-passed {' +
           '  background: #dcfce7;' +
           '  color: #166534;' +
           '}' +
           '.status-failed {' +
           '  background: #fef2f2;' +
           '  color: #991b1b;' +
           '}' +
           '.status-pending {' +
           '  background: #fef3c7;' +
           '  color: #92400e;' +
           '}' +
           '.test-meta {' +
           '  display: flex;' +
           '  gap: 1rem;' +
           '  font-size: 0.8rem;' +
           '  color: var(--text-secondary);' +
           '  margin-top: 0.5rem;' +
           '}' +
           '.test-details {' +
           '  margin-top: 1rem;' +
           '  padding-top: 1rem;' +
           '  border-top: 1px solid var(--border-color);' +
           '  display: none;' +
           '}' +
           '.test-details.expanded {' +
           '  display: block;' +
           '}' +
           '.chart-container {' +
           '  position: relative;' +
           '  height: 300px;' +
           '  margin: 1rem 0;' +
           '}' +
           '.progress-bar {' +
           '  width: 100%;' +
           '  height: 8px;' +
           '  background: var(--border-color);' +
           '  border-radius: 4px;' +
           '  overflow: hidden;' +
           '  margin: 0.5rem 0;' +
           '}' +
           '.progress-fill {' +
           '  height: 100%;' +
           '  background: var(--success-color);' +
           '  transition: width 0.3s ease;' +
           '}' +
           '.metrics-grid {' +
           '  display: grid;' +
           '  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));' +
           '  gap: 1rem;' +
           '  margin: 1rem 0;' +
           '}' +
           '.metric-card {' +
           '  text-align: center;' +
           '  padding: 1rem;' +
           '  background: var(--light-bg);' +
           '  border-radius: 8px;' +
           '}' +
           '.metric-value {' +
           '  font-size: 1.5rem;' +
           '  font-weight: 700;' +
           '  color: var(--primary-color);' +
           '}' +
           '.metric-label {' +
           '  font-size: 0.875rem;' +
           '  color: var(--text-secondary);' +
           '  margin-top: 0.25rem;' +
           '}' +
           '.expandable {' +
           '  cursor: pointer;' +
           '}' +
           '.expand-icon {' +
           '  transition: transform 0.2s;' +
           '}' +
           '.expanded .expand-icon {' +
           '  transform: rotate(180deg);' +
           '}' +
           '.hidden {' +
           '  display: none !important;' +
           '}' +
           '@media (max-width: 768px) {' +
           '  .header-content {' +
           '    flex-direction: column;' +
           '    text-align: center;' +
           '    gap: 1rem;' +
           '  }' +
           '  .header-stats {' +
           '    justify-content: center;' +
           '  }' +
           '  .filter-row {' +
           '    flex-direction: column;' +
           '    align-items: stretch;' +
           '  }' +           '  .dashboard {' +
           '    grid-template-columns: 1fr;' +
           '  }' +
           '}' +
           
           /* Estilos para detalhes de API */ +
           '.api-details-section { margin-top: 20px; border-top: 1px solid var(--border-color); padding-top: 15px; }' +
           '.api-details-section h5 { font-size: 16px; margin-bottom: 12px; color: var(--primary-color); }' +
           '.api-call-item { margin-bottom: 18px; padding: 12px; border-radius: 8px; background-color: #f9fafb; border: 1px solid var(--border-color); }' +
           '.api-header { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; flex-wrap: wrap; }' +
           '.api-method { padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 13px; }' +
           '.api-method-get { background-color: rgba(59, 130, 246, 0.2); color: #2563eb; }' +
           '.api-method-post { background-color: rgba(16, 185, 129, 0.2); color: #059669; }' +
           '.api-method-put { background-color: rgba(245, 158, 11, 0.2); color: #d97706; }' +
           '.api-method-delete { background-color: rgba(239, 68, 68, 0.2); color: #dc2626; }' +
           '.api-url { font-family: monospace; font-size: 13px; flex-grow: 1; }' +
           '.status-code { font-weight: bold; padding: 3px 8px; border-radius: 4px; font-size: 13px; }' +
           '.status-code.success { background-color: rgba(16, 185, 129, 0.2); color: #059669; }' +
           '.status-code.error { background-color: rgba(239, 68, 68, 0.2); color: #dc2626; }' +
           '.api-response { margin-top: 10px; }' +
           '.api-response h6 { font-size: 14px; margin-bottom: 5px; color: var(--text-secondary); }' +
           '.api-response pre { max-height: 300px; overflow: auto; background-color: #f1f5f9; padding: 10px; border-radius: 6px; font-size: 12px; }' +
           '.api-timestamp { font-size: 11px; color: var(--text-secondary); text-align: right; margin-top: 8px; }' +
           '.api-count { font-size: 12px; background-color: rgba(59, 130, 246, 0.2); color: #2563eb; padding: 2px 6px; border-radius: 10px; }' +
           '</style>';
  }

  /**
   * Gera seção de cabeçalho
   */
  static generateHeaderSection(totalStats) {
    const successRate = totalStats.tests > 0 ? 
      Math.round((totalStats.passes / totalStats.tests) * 100) : 0;
    
    const duration = this.formatDuration(totalStats.duration);

    return '<header class="header">' +
           '<div class="header-content">' +
           '<div>' +
           '<h1>Relatório Avançado de Testes</h1>' +
           '<p>Dashboard Interativo de Análise Cypress</p>' +
           '</div>' +
           '<div class="header-stats">' +
           '<div class="stat-item">' +
           '<span class="stat-value">' + totalStats.tests + '</span>' +
           '<span class="stat-label">Total de Testes</span>' +
           '</div>' +
           '<div class="stat-item">' +
           '<span class="stat-value">' + totalStats.passes + '</span>' +
           '<span class="stat-label">Sucessos</span>' +
           '</div>' +
           '<div class="stat-item">' +
           '<span class="stat-value">' + totalStats.failures + '</span>' +
           '<span class="stat-label">Falhas</span>' +
           '</div>' +
           '<div class="stat-item">' +
           '<span class="stat-value">' + successRate + '%</span>' +
           '<span class="stat-label">Taxa de Sucesso</span>' +
           '</div>' +
           '<div class="stat-item">' +
           '<span class="stat-value">' + duration + '</span>' +
           '<span class="stat-label">Duração Total</span>' +
           '</div>' +
           '</div>' +
           '</div>' +
           '</header>';
  }

  /**
   * Gera seção do dashboard
   */
  static generateDashboardSection(metricsData, analysisData, testDetails) {
    return '<section class="dashboard">' +
           this.generateOverviewCard(testDetails) +
           this.generatePerformanceCard(metricsData) +
           this.generateSystemCard(metricsData) +
           this.generateAnalysisCard(analysisData) +
           '</section>';
  }

  /**
   * Gera card de visão geral
   */
  static generateOverviewCard(testDetails) {
    const specs = testDetails.specs.length;
    const avgDuration = testDetails.totalStats.tests > 0 ? 
      Math.round(testDetails.totalStats.duration / testDetails.totalStats.tests) : 0;

    return '<div class="card">' +           '<div class="card-header">' +
           '<h3 class="card-title">Visão Geral</h3>' +
           '</div>' +
           '<div class="metrics-grid">' +
           '<div class="metric-card">' +
           '<div class="metric-value">' + specs + '</div>' +
           '<div class="metric-label">Specs Executados</div>' +
           '</div>' +
           '<div class="metric-card">' +
           '<div class="metric-value">' + testDetails.totalStats.suites + '</div>' +
           '<div class="metric-label">Suites</div>' +
           '</div>' +
           '<div class="metric-card">' +
           '<div class="metric-value">' + avgDuration + 'ms</div>' +
           '<div class="metric-label">Duração Média</div>' +
           '</div>' +
           '<div class="metric-card">' +
           '<div class="metric-value">' + testDetails.totalStats.pending + '</div>' +
           '<div class="metric-label">Pendentes</div>' +
           '</div>' +
           '</div>' +
           '</div>';
  }

  /**
   * Gera card de performance
   */
  static generatePerformanceCard(metricsData) {
    const duration = metricsData.endTime && metricsData.startTime ? 
      this.formatDuration(metricsData.endTime - metricsData.startTime) : 'N/A';

    return '<div class="card">' +           '<div class="card-header">' +
           '<h3 class="card-title">Performance</h3>' +
           '</div>' +
           '<div class="metrics-grid">' +
           '<div class="metric-card">' +
           '<div class="metric-value">' + duration + '</div>' +
           '<div class="metric-label">Tempo Total</div>' +
           '</div>' +
           '<div class="metric-card">' +
           '<div class="metric-value">' + (metricsData.specs ? metricsData.specs.length : 0) + '</div>' +
           '<div class="metric-label">Specs Analisados</div>' +
           '</div>' +
           '</div>' +
           '</div>';
  }

  /**
   * Gera card do sistema
   */
  static generateSystemCard(metricsData) {
    const system = metricsData.system || {};

    return '<div class="card">' +
           '<div class="card-header">' +           '<h3 class="card-title">Sistema</h3>' +
           '</div>' +
           '<div class="metrics-grid">' +
           '<div class="metric-card">' +
           '<div class="metric-value">' + (system.platform || 'N/A') + '</div>' +
           '<div class="metric-label">Plataforma</div>' +
           '</div>' +
           '<div class="metric-card">' +
           '<div class="metric-value">' + (system.cpus || 'N/A') + '</div>' +
           '<div class="metric-label">CPUs</div>' +
           '</div>' +
           '<div class="metric-card">' +
           '<div class="metric-value">' + this.formatBytes(system.totalMemory || 0) + '</div>' +
           '<div class="metric-label">Memória Total</div>' +
           '</div>' +
           '<div class="metric-card">' +
           '<div class="metric-value">' + (system.nodeVersion || 'N/A') + '</div>' +
           '<div class="metric-label">Node.js</div>' +
           '</div>' +
           '</div>' +
           '</div>';
  }

  /**
   * Gera card de análise
   */
  static generateAnalysisCard(analysisData) {
    return '<div class="card">' +           '<div class="card-header">' +
           '<h3 class="card-title">Análise Avançada</h3>' +
           '</div>' +
           '<p>Análises detalhadas de padrões e tendências estão disponíveis nos relatórios específicos.</p>' +
           '</div>';
  }

  /**
   * Gera seção de testes com filtros avançados
   */  static generateTestsSection(testDetails, apiResponses = []) {
    return '<section class="tests-section">' +
           '<div class="card">' +
           '<div class="card-header">' +           '<h3 class="card-title">Testes Detalhados</h3>' +
           '</div>' +
           this.generateFilters() +
           '<div class="tests-grid" id="testsGrid">' +
           this.generateTestItems(testDetails.tests, apiResponses) +
           '</div>' +
           '</div>' +
           '</section>';
  }

  /**
   * Gera filtros interativos
   */
  static generateFilters() {
    return '<div class="filters">' +
           '<div class="filter-row">' +
           '<div class="filter-group">' +
           '<label class="filter-label">Buscar Teste</label>' +
           '<input type="text" class="filter-input" id="searchFilter" placeholder="Digite para buscar...">' +
           '</div>' +
           '<div class="filter-group">' +
           '<label class="filter-label">Status</label>' +
           '<select class="filter-select" id="statusFilter">' +
           '<option value="">Todos</option>' +
           '<option value="passed">Passou</option>' +
           '<option value="failed">Falhou</option>' +
           '<option value="pending">Pendente</option>' +
           '</select>' +
           '</div>' +
           '<div class="filter-group">' +
           '<label class="filter-label">Spec</label>' +
           '<select class="filter-select" id="specFilter">' +
           '<option value="">Todos os Specs</option>' +
           '</select>' +
           '</div>' +
           '<div class="filter-group">' +
           '<label class="filter-label">Duração</label>' +
           '<select class="filter-select" id="durationFilter">' +
           '<option value="">Todas</option>' +
           '<option value="fast">Rápidos (&lt; 1s)</option>' +
           '<option value="medium">Médios (1-5s)</option>' +
           '<option value="slow">Lentos (&gt; 5s)</option>' +
           '</select>' +
           '</div>' +
           '<button class="btn btn-primary" onclick="clearFilters()">' +
           'Limpar Filtros' +
           '</button>' +
           '</div>' +
           '</div>';
  }  /**
   * Gera itens de teste individuais
   */
  static generateTestItems(tests, apiResponses = []) {
    if (!tests || tests.length === 0) {
      return '<div class="test-item"><p>Nenhum teste encontrado.</p></div>';
    }

    return tests.map((test, index) => {
      const statusClass = 'status-' + (test.state || 'unknown');
      const duration = test.duration ? test.duration + 'ms' : 'N/A';
      
      // Buscar chamadas de API relacionadas a este teste
      const testApiCalls = apiResponses.filter(api => 
        api.testTitle && test.fullTitle && 
        (api.testTitle.includes(test.title) || test.fullTitle.includes(api.testTitle))
      );
      
      return '<div class="test-item" data-status="' + (test.state || '') + '" data-spec="' + (test.spec || '') + '" data-duration="' + (test.duration || 0) + '">' +
             '<div class="test-header">' +
             '<div class="test-title">' + (test.title || 'Teste sem título') + '</div>' +
             '<span class="test-status ' + statusClass + '">' + (test.state || 'unknown') + '</span>' +
             '</div>' +
             '<div class="test-meta">' +             '<span>' + (test.spec || 'N/A') + '</span>' +
             '<span>' + duration + '</span>' +
             '<span>' + (test.suite || 'N/A') + '</span>' +
             (testApiCalls.length > 0 ? '<span class="api-count">' + testApiCalls.length + ' API calls</span>' : '') +
             '</div>' +
             '<div class="test-details" id="details-' + index + '">' +
             '<h4>Detalhes do Teste</h4>' +
             '<p><strong>Título Completo:</strong> ' + (test.fullTitle || test.title || 'N/A') + '</p>' +
             (test.err ? '<p><strong>Erro:</strong></p><pre>' + this.escapeHtml(JSON.stringify(test.err, null, 2)) + '</pre>' : '') +
             (test.code ? '<p><strong>Código:</strong></p><pre>' + this.escapeHtml(test.code) + '</pre>' : '') +
             this.generateApiDetailsSection(testApiCalls) +             '</div>' +             '<div class="expandable" onclick="toggleTestDetails(' + index + ')">' +
             'Ver Detalhes' +
             '</div>' +
             '</div>';
    }).join('');
  }

  /**
   * Gera seção de detalhes das chamadas de API
   */
  static generateApiDetailsSection(apiCalls) {
    if (!apiCalls || apiCalls.length === 0) {
      return '';
    }

    let apiHtml = '<div class="api-details-section">' +
                  '<h5>Chamadas de API</h5>';

    apiCalls.forEach((api, index) => {
      const statusClass = api.status >= 200 && api.status < 300 ? 'success' : 'error';
      const methodClass = 'api-method-' + (api.method || 'unknown').toLowerCase();
      
      apiHtml += '<div class="api-call-item">' +
                 '<div class="api-header">' +
                 '<span class="api-method ' + methodClass + '">' + (api.method || 'N/A') + '</span>' +
                 '<span class="api-url">' + (api.url || 'N/A') + '</span>' +
                 '<span class="status-code ' + statusClass + '">' + (api.status || 'N/A') + '</span>' +
                 '</div>' +
                 '<div class="api-response">' +
                 '<h6>Response:</h6>' +
                 '<pre>' + this.escapeHtml(JSON.stringify(api.response || {}, null, 2)) + '</pre>' +
                 '</div>' +
                 '<div class="api-timestamp">' +
                 '<small>Timestamp: ' + (api.timestamp || 'N/A') + '</small>' +
                 '</div>' +
                 '</div>';
    });

    apiHtml += '</div>';
    return apiHtml;
  }

  /**
   * Gera seção de métricas
   */  static generateMetricsSection(metricsData) {
    return '\n<section class="metrics-section">\n' +
           '<div class="card">\n' +           '<div class="card-header">\n' +
           '<h3 class="card-title">Métricas Avançadas</h3>\n'+
           '</div>\n' +
           '<div class="chart-container"><canvas id="metricsChart"></canvas></div>\n' +
           '</div>\n' +
           '</section>\n';
  }
  /**
   * Gera seção de gráficos
   */
  static generateChartsSection(testDetails, metricsData) {
    return '\n<section class="charts-section">\n' +
           '<div class="dashboard">\n' +
           '<div class="card">\n' +           '<div class="card-header">\n' +
           '<h3 class="card-title">Distribuição de Status</h3>\n' +
           '</div>\n' +
           '<div class="chart-container"><canvas id="statusChart"></canvas></div>\n' +
           '</div>\n' +
           '<div class="card">\n' +
           '<div class="card-header">\n' +
           '<h3 class="card-title">Performance por Spec</h3>\n'+
           '</div>\n' +
           '<div class="chart-container"><canvas id="performanceChart"></canvas></div>\n' +
           '</div>\n' +
           '</div>\n' +
           '</section>\n';
  }
  /**
   * Gera JavaScript avançado para interatividade
   */
  static generateAdvancedJavaScript(testDetails = null) {
    // Se testDetails for fornecido, usar dados reais, senão usar dados vazios
    const chartData = testDetails ? {
      specs: testDetails.specs || [],
      tests: testDetails.tests || [],
      totalStats: testDetails.totalStats || { tests: 0, passes: 0, failures: 0, pending: 0 }
    } : {
      specs: [],
      tests: [],
      totalStats: { tests: 0, passes: 0, failures: 0, pending: 0 }
    };

    return '\n<script>\n' +
           // Dados para os gráficos
           'const testData = ' + JSON.stringify(chartData) + ';\n' +
           // Funções de filtro
           'function initializeFilters() {\n' +
           '  const specFilter = document.getElementById("specFilter");\n' +
           '  const specs = [...new Set(Array.from(document.querySelectorAll(".test-item")).map(item => item.dataset.spec))];\n' +
           '  specs.forEach(spec => {\n' +
           '    if (spec) {\n' +
           '      const option = document.createElement("option");\n' +
           '      option.value = spec;\n' +
           '      option.textContent = spec;\n' +
           '      specFilter.appendChild(option);\n' +
           '    }\n' +
           '  });\n' +
           '  \n' +
           '  document.getElementById("searchFilter").addEventListener("input", applyFilters);\n' +
           '  document.getElementById("statusFilter").addEventListener("change", applyFilters);\n' +
           '  document.getElementById("specFilter").addEventListener("change", applyFilters);\n' +
           '  document.getElementById("durationFilter").addEventListener("change", applyFilters);\n' +           '}\n' +
           
           // Aplicar filtros
           'function applyFilters() {\n' +
           '  const searchTerm = document.getElementById("searchFilter").value.toLowerCase();\n' +
           '  const statusFilter = document.getElementById("statusFilter").value;\n' +
           '  const specFilter = document.getElementById("specFilter").value;\n' +
           '  const durationFilter = document.getElementById("durationFilter").value;\n' +
           '  \n' +
           '  const testItems = document.querySelectorAll(".test-item");\n' +
           '  let visibleCount = 0;\n' +
           '  \n' +
           '  testItems.forEach(item => {\n' +
           '    const title = item.querySelector(".test-title").textContent.toLowerCase();\n' +
           '    const status = item.dataset.status;\n' +
           '    const spec = item.dataset.spec;\n' +
           '    const duration = parseInt(item.dataset.duration) || 0;\n' +
           '    \n' +
           '    let show = true;\n' +
           '    \n' +
           '    if (searchTerm && !title.includes(searchTerm)) show = false;\n' +
           '    if (statusFilter && status !== statusFilter) show = false;\n' +
           '    if (specFilter && spec !== specFilter) show = false;\n' +
           '    \n' +
           '    if (durationFilter) {\n' +
           '      if (durationFilter === "fast" && duration >= 1000) show = false;\n' +
           '      if (durationFilter === "medium" && (duration < 1000 || duration > 5000)) show = false;\n' +
           '      if (durationFilter === "slow" && duration <= 5000) show = false;\n' +
           '    }\n' +
           '    \n' +
           '    if (show) {\n' +
           '      item.style.display = "block";\n' +
           '      visibleCount++;\n' +
           '    } else {\n' +
           '      item.style.display = "none";\n' +
           '    }\n' +
           '  });\n' +
           '  \n' +
           '  console.log("Filtros aplicados. Testes visíveis:", visibleCount);\n' +
           '}\n' +
           
           // Limpar filtros
           'function clearFilters() {\n' +
           '  document.getElementById("searchFilter").value = "";\n' +
           '  document.getElementById("statusFilter").value = "";\n' +
           '  document.getElementById("specFilter").value = "";\n' +
           '  document.getElementById("durationFilter").value = "";\n' +
           '  applyFilters();\n' +
           '}\n' +
           
           '// === TOGGLE TEST DETAILS FUNCTION ===\n' +
           // Toggle detalhes do teste
           'function toggleTestDetails(index) {\n' +
           '  console.log("toggleTestDetails chamado com index:", index);\n' +
           '  const details = document.getElementById("details-" + index);\n' +
           '  console.log("Elemento details encontrado:", details);\n' +
           '  if (!details) {\n' +
           '    console.error("Elemento details não encontrado para index:", index);\n' +
           '    return;\n' +
           '  }\n' +
           '  const testItem = details.closest(".test-item");\n' +
           '  console.log("Elemento testItem encontrado:", testItem);\n' +
           '  const expandable = testItem.querySelector(".expandable");\n' +
           '  console.log("Elemento expandable encontrado:", expandable);\n' +
           '  \n' +
           '  if (details.classList.contains("expanded")) {\n' +
           '    console.log("Removendo classe expanded");\n' +
           '    details.classList.remove("expanded");\n' +
           '    expandable.innerHTML = \'Ver Detalhes\';\n' +
           '  } else {\n' +
           '    console.log("Adicionando classe expanded");\n' +
           '    details.classList.add("expanded");\n' +
           '    expandable.innerHTML = \'Ocultar Detalhes\';\n' +           '  }\n' +
           '}\n' +
           
           // Inicializar gráficos
           'function initializeCharts() {\n' +
           '  try {\n' +
           '    if (typeof Chart !== "undefined") {\n' +
           '      initializeMetricsChart();\n' +
           '      initializeStatusChart();\n' +
           '      initializePerformanceChart();\n' +
           '    }\n' +
           '  } catch (error) {\n' +
           '    console.warn("Erro ao inicializar gráficos:", error);\n' +
           '  }\n' +
           '}\n' +           
           // Gráfico de métricas avançadas
           'function initializeMetricsChart() {\n' +
           '  console.log(" Inicializando gráfico de métricas...");\n' +
           '  const ctx = document.getElementById("metricsChart");\n' +
           '  if (!ctx) {\n' +
           '    console.warn(" Canvas metricsChart não encontrado!");\n' +
           '    return;\n' +
           '  }\n' +
           '  console.log(" Canvas metricsChart encontrado");\n' +
           '  \n' +
           '  // Dados das métricas extraídos dos dados dos testes\n' +
           '  const testItems = document.querySelectorAll(".test-item");\n' +
           '  console.log(" Total de test items:", testItems.length);\n' +
           '  const totalTests = testItems.length;\n' +
           '  const passedTests = document.querySelectorAll(".test-item[data-status=\\"passed\\"]").length;\n' +
           '  const failedTests = document.querySelectorAll(".test-item[data-status=\\"failed\\"]").length;\n' +
           '  const pendingTests = document.querySelectorAll(".test-item[data-status=\\"pending\\"]").length;\n' +
           '  \n' +
           '  let totalDuration = 0;\n' +
           '  testItems.forEach(item => {\n' +
           '    totalDuration += parseInt(item.dataset.duration) || 0;\n' +
           '  });\n' +
           '  const avgDuration = totalTests > 0 ? Math.round(totalDuration / totalTests) : 0;\n' +
           '  const successRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;\n' +
           '  \n' +
           '  console.log(" Dados calculados:", { totalTests, passedTests, failedTests, avgDuration, successRate });\n' +
           '  \n' +
           '  try {\n' +
           '    new Chart(ctx, {\n' +
           '      type: "radar",\n' +
           '      data: {\n' +
           '        labels: ["Taxa de Sucesso (%)", "Velocidade Média", "Cobertura", "Estabilidade", "Performance"],\n' +
           '        datasets: [{\n' +
           '          label: "Métricas do Projeto",\n' +
           '          data: [successRate, Math.min(100, Math.max(0, 100 - (avgDuration / 50))), 85, successRate, Math.min(100, Math.max(0, 100 - (avgDuration / 100)))],\n' +
           '          backgroundColor: "rgba(59, 130, 246, 0.2)",\n' +
           '          borderColor: "#3b82f6",\n' +
           '          borderWidth: 2\n' +
           '        }]\n' +
           '      },\n' +
           '      options: {\n' +
           '        responsive: true,\n' +
           '        maintainAspectRatio: false,\n' +
           '        scales: {\n' +
           '          r: {\n' +
           '            beginAtZero: true,\n' +
           '            max: 100\n' +
           '          }\n' +
           '        },\n' +
           '        plugins: {\n' +
           '          legend: { position: "bottom" }\n' +
           '        }\n' +
           '      }\n' +
           '    });\n' +
           '    console.log(" Gráfico de métricas criado com sucesso");\n' +
           '  } catch (error) {\n' +
           '    console.error(" Erro ao criar gráfico de métricas:", error);\n' +
           '  }\n' +
           '}\n' +
           
           // Gráfico de status
           'function initializeStatusChart() {\n' +
           '  console.log(" Inicializando gráfico de status...");\n' +
           '  const ctx = document.getElementById("statusChart");\n' +
           '  if (!ctx) {\n' +
           '    console.warn(" Canvas statusChart não encontrado!");\n' +
           '    return;\n' +
           '  }\n' +
           '  console.log(" Canvas statusChart encontrado");\n' +
           '  \n' +
           '  const testItems = document.querySelectorAll(".test-item");\n' +
           '  const statusCounts = { passed: 0, failed: 0, pending: 0 };\n' +
           '  \n' +
           '  testItems.forEach(item => {\n' +
           '    const status = item.dataset.status;\n' +
           '    if (statusCounts.hasOwnProperty(status)) {\n' +
           '      statusCounts[status]++;\n' +
           '    }\n' +
           '  });\n' +
           '  \n' +
           '  console.log(" Contadores de status:", statusCounts);\n' +
           '  \n' +
           '  try {\n' +
           '    new Chart(ctx, {\n' +
           '      type: "doughnut",\n' +
           '      data: {\n' +
           '        labels: ["Passou", "Falhou", "Pendente"],\n' +
           '        datasets: [{\n' +
           '          data: [statusCounts.passed, statusCounts.failed, statusCounts.pending],\n' +
           '          backgroundColor: ["#10b981", "#ef4444", "#f59e0b"]\n' +
           '        }]\n' +
           '      },\n' +
           '      options: {\n' +
           '        responsive: true,\n' +
           '        maintainAspectRatio: false,\n' +
           '        plugins: {\n' +
           '          legend: { position: "bottom" }\n' +
           '        }\n' +
           '      }\n' +
           '    });\n' +
           '    console.log(" Gráfico de status criado com sucesso");\n' +
           '  } catch (error) {\n' +
           '    console.error(" Erro ao criar gráfico de status:", error);\n' +
           '  }\n' +
           '}\n' +
           
           // Gráfico de performance
           'function initializePerformanceChart() {\n' +
           '  console.log(" Inicializando gráfico de performance...");\n' +
           '  const ctx = document.getElementById("performanceChart");\n' +
           '  if (!ctx) {\n' +
           '    console.warn(" Canvas performanceChart não encontrado!");\n' +
           '    return;\n' +
           '  }\n' +
           '  console.log(" Canvas performanceChart encontrado");\n' +
           '  \n' +
           '  const specs = {};\n' +
           '  document.querySelectorAll(".test-item").forEach(item => {\n' +
           '    const spec = item.dataset.spec;\n' +
           '    const duration = parseInt(item.dataset.duration) || 0;\n' +
           '    if (!specs[spec]) specs[spec] = [];\n' +
           '    specs[spec].push(duration);\n' +
           '  });\n' +
           '  \n' +
           '  const labels = Object.keys(specs);\n' +
           '  const data = labels.map(spec => {\n' +
           '    const durations = specs[spec];\n' +
           '    return durations.reduce((sum, d) => sum + d, 0) / durations.length;\n' +
           '  });\n' +
           '  \n' +
           '  console.log(" Dados de performance:", { labels, data });\n' +
           '  \n' +
           '  try {\n' +
           '    new Chart(ctx, {\n' +
           '      type: "bar",\n' +
           '      data: {\n' +
           '        labels: labels,\n' +
           '        datasets: [{\n' +
           '          label: "Duração Média (ms)",\n' +
           '          data: data,\n' +
           '          backgroundColor: "#2563eb"\n' +
           '        }]\n' +
           '      },\n' +
           '      options: {\n' +
           '        responsive: true,\n' +
           '        maintainAspectRatio: false,\n' +
           '        scales: {\n' +
           '          y: { beginAtZero: true }\n' +
           '        }\n' +
           '      }\n' +
           '    });\n' +
           '    console.log(" Gráfico de performance criado com sucesso");\n' +
           '  } catch (error) {\n' +
           '    console.error(" Erro ao criar gráfico de performance:", error);\n' +
           '  }\n' +
           '}\n' +
           
           // Inicialização
           'document.addEventListener("DOMContentLoaded", function() {\n' +
           '  console.log(" Inicializando relatório interativo...");\n' +
           '  console.log(" Chart.js disponível:", typeof Chart !== "undefined");\n' +
           '  console.log(" Canvas metricsChart:", document.getElementById("metricsChart") ? "ENCONTRADO" : "NÃO ENCONTRADO");\n' +
           '  console.log(" Canvas statusChart:", document.getElementById("statusChart") ? "ENCONTRADO" : "NÃO ENCONTRADO");\n' +
           '  console.log(" Canvas performanceChart:", document.getElementById("performanceChart") ? "ENCONTRADO" : "NÃO ENCONTRADO");\n' +
           '  initializeFilters();\n' +
           '  setTimeout(() => {\n' +
           '    console.log("⏰ Inicializando gráficos após timeout...");\n' +
           '    initializeCharts();\n' +
           '  }, 500);\n' +
           '  console.log(" Relatório interativo carregado com sucesso!");\n' +
           '});\n' +
           '</script>\n';
  }

  // Utilitários
  static formatDuration(ms) {
    if (!ms) return '0ms';
    if (ms < 1000) return ms + 'ms';
    if (ms < 60000) return (ms / 1000).toFixed(1) + 's';
    return (ms / 60000).toFixed(1) + 'min';
  }

  static formatBytes(bytes) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  static escapeHtml(text) {
    if (!text) return '';
    return text.toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}

module.exports = AdvancedHtmlReportGenerator;

