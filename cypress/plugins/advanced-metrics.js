const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Plugin para coletar métricas avançadas durante os testes
 * Complementa o sistema de relatórios com dados de sistema e performance
 */
class AdvancedMetrics {
  /**
   * Configura coleta de métricas avançadas
   */
  static setupAdvancedMetrics(on, config) {
    console.log('Configurando coleta de métricas avançadas...');

    // Evento antes de cada spec
    on('before:spec', (spec) => {
      this.startSpecMetrics(spec);
    });

    // Evento após cada spec
    on('after:spec', (spec, results) => {
      this.endSpecMetrics(spec, results);
    });

    // Evento antes da execução
    on('before:run', (details) => {
      this.initializeMetrics(config.projectRoot);
    });

    // NOTA: Hook 'after:run' será chamado manualmente no cypress.config.ts
    // para garantir a ordem correta de finalização das métricas

    return config;
  }  /**
   * Inicializa coleta de métricas
   */  static initializeMetrics(projectRoot) {
    console.log('Inicializando sistema de métricas avançadas...');
    
    // PRIMEIRO: Garantir estrutura de diretórios
    this.ensureDirectoryStructure(projectRoot);
    
    // SEGUNDO: Limpar todos os relatórios antigos
    this.cleanOldReports(projectRoot);
    
    // TERCEIRO: Limpar arquivos temporários residuais
    this.cleanTempFiles();
      const metricsData = {
      startTime: Date.now(),
      executionId: this.generateExecutionId(),
      system: this.getSystemInfo(),
      specs: [],
      performance: {
        memoryUsage: [],
        cpuUsage: []
      }
    };

    // Garantir que o diretório de relatórios existe
    const reportsDir = path.join(projectRoot, 'cypress', 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const metricsPath = path.join(reportsDir, 'advanced-metrics.json');
    try {
      fs.writeFileSync(metricsPath, JSON.stringify(metricsData, null, 2));
      console.log('Métricas avançadas inicializadas');
    } catch (error) {
      console.warn('Aviso: Não foi possível inicializar métricas avançadas:', error.message);
    }
  }

  /**
   * Inicia métricas para um spec
   */
  static startSpecMetrics(spec) {
    const specData = {
      spec: spec.name,
      absolute: spec.absolute,
      relative: spec.relative,
      startTime: Date.now(),
      memoryBefore: process.memoryUsage()
    };

    // Salvar em arquivo temporário
    const tempPath = path.join(process.cwd(), 'temp_spec_metrics.json');
    fs.writeFileSync(tempPath, JSON.stringify(specData, null, 2));
  }

  /**
   * Finaliza métricas para um spec
   */
  static endSpecMetrics(spec, results) {
    try {
      const tempPath = path.join(process.cwd(), 'temp_spec_metrics.json');
      
      if (!fs.existsSync(tempPath)) return;
      
      const specData = JSON.parse(fs.readFileSync(tempPath, 'utf8'));
      
      // Completar dados do spec
      specData.endTime = Date.now();
      specData.duration = specData.endTime - specData.startTime;
      specData.memoryAfter = process.memoryUsage();
      specData.memoryDelta = {
        rss: specData.memoryAfter.rss - specData.memoryBefore.rss,
        heapUsed: specData.memoryAfter.heapUsed - specData.memoryBefore.heapUsed,
        heapTotal: specData.memoryAfter.heapTotal - specData.memoryBefore.heapTotal
      };
      specData.results = {
        tests: results.tests,
        passes: results.passes,
        failures: results.failures,
        pending: results.pending,
        skipped: results.skipped,
        duration: results.duration
      };

      // Adicionar ao arquivo principal de métricas
      const metricsPath = path.join(process.cwd(), 'cypress', 'reports', 'advanced-metrics.json');
      
      if (fs.existsSync(metricsPath)) {
        const metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
        metrics.specs.push(specData);
        
        // Adicionar snapshot de performance
        metrics.performance.memoryUsage.push({
          timestamp: Date.now(),
          ...process.memoryUsage()
        });
        
        fs.writeFileSync(metricsPath, JSON.stringify(metrics, null, 2));
      }

      // Limpar arquivo temporário
      fs.unlinkSync(tempPath);
      
    } catch (error) {
      console.error('Erro ao processar métricas do spec:', error.message);
    }
  }

  /**
   * Finaliza coleta de métricas
   */
  static finalizeMetrics(results, projectRoot) {
    try {
      const metricsPath = path.join(projectRoot, 'cypress', 'reports', 'advanced-metrics.json');
      
      if (!fs.existsSync(metricsPath)) return;
      
      const metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
      
      // Finalizar dados gerais
      metrics.endTime = Date.now();
      metrics.totalDuration = metrics.endTime - metrics.startTime;
      metrics.summary = {
        totalSpecs: metrics.specs.length,
        totalTests: results.totalTests,
        totalPassed: results.totalPassed,
        totalFailed: results.totalFailed,
        totalPending: results.totalPending,
        totalSkipped: results.totalSkipped,
        totalDuration: results.totalDuration,
        averageSpecDuration: metrics.specs.length > 0 ? 
          metrics.specs.reduce((sum, spec) => sum + spec.duration, 0) / metrics.specs.length : 0
      };

      // Análise de performance
      metrics.analysis = this.generatePerformanceAnalysis(metrics);
      
      fs.writeFileSync(metricsPath, JSON.stringify(metrics, null, 2));
      
      console.log('Métricas avançadas finalizadas');
      
    } catch (error) {
      console.error('Erro ao finalizar métricas:', error.message);
    }
  }

  /**
   * Coleta informações do sistema
   */
  static getSystemInfo() {
    return {
      platform: os.platform(),
      architecture: os.arch(),
      release: os.release(),
      type: os.type(),
      hostname: os.hostname(),
      cpus: os.cpus().length,
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version,
      pid: process.pid,
      uptime: os.uptime()
    };
  }

  /**
   * Gera análise de performance
   */
  static generatePerformanceAnalysis(metrics) {
    const analysis = {
      memoryTrend: 'stable',
      memoryPeak: 0,
      slowestSpecs: [],
      fastestSpecs: [],
      resourceUsage: 'normal'
    };

    // Analisar uso de memória
    if (metrics.performance.memoryUsage.length > 0) {
      const memoryValues = metrics.performance.memoryUsage.map(m => m.heapUsed);
      analysis.memoryPeak = Math.max(...memoryValues);
      
      const first = memoryValues[0];
      const last = memoryValues[memoryValues.length - 1];
      const percentageChange = ((last - first) / first) * 100;
      
      if (percentageChange > 20) {
        analysis.memoryTrend = 'increasing';
      } else if (percentageChange < -20) {
        analysis.memoryTrend = 'decreasing';
      }
    }

    // Analisar specs mais lentos e rápidos
    const sortedSpecs = metrics.specs.sort((a, b) => b.duration - a.duration);
    analysis.slowestSpecs = sortedSpecs.slice(0, 3).map(spec => ({
      name: path.basename(spec.spec),
      duration: spec.duration,
      memoryUsed: spec.memoryDelta.heapUsed
    }));
    
    analysis.fastestSpecs = sortedSpecs.slice(-3).reverse().map(spec => ({
      name: path.basename(spec.spec),
      duration: spec.duration,
      memoryUsed: spec.memoryDelta.heapUsed
    }));

    return analysis;
  }

  /**
   * Gera relatório de benchmark
   */
  static generateBenchmarkReport(projectRoot) {
    try {
      const metricsPath = path.join(projectRoot, 'cypress', 'reports', 'advanced-metrics.json');
      
      if (!fs.existsSync(metricsPath)) {
        console.log('Arquivo de métricas não encontrado');
        return;
      }

      const metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
      
      const benchmark = `
=== RELATÓRIO DE BENCHMARK - CYPRESS ===
Data: ${new Date().toLocaleString('pt-BR')}

RESUMO GERAL:
- Total de Specs: ${metrics.summary.totalSpecs}
- Total de Testes: ${metrics.summary.totalTests}
- Duração Total: ${(metrics.totalDuration / 1000).toFixed(2)}s
- Duração Média por Spec: ${(metrics.summary.averageSpecDuration / 1000).toFixed(2)}s

SISTEMA:
- SO: ${metrics.system.platform} ${metrics.system.release}
- CPUs: ${metrics.system.cpus}
- Memória Total: ${(metrics.system.totalMemory / 1024 / 1024 / 1024).toFixed(2)} GB
- Node.js: ${metrics.system.nodeVersion}

PERFORMANCE:
- Tendência de Memória: ${metrics.analysis.memoryTrend}
- Pico de Memória: ${(metrics.analysis.memoryPeak / 1024 / 1024).toFixed(2)} MB
- Uso de Recursos: ${metrics.analysis.resourceUsage}

SPECS MAIS LENTOS:
${metrics.analysis.slowestSpecs.map(spec => 
  `- ${spec.name}: ${(spec.duration / 1000).toFixed(2)}s`
).join('\n')}

SPECS MAIS RÁPIDOS:
${metrics.analysis.fastestSpecs.map(spec => 
  `- ${spec.name}: ${(spec.duration / 1000).toFixed(2)}s`
).join('\n')}

DETALHES DE MEMÓRIA:
${metrics.specs.map(spec => 
  `- ${path.basename(spec.spec)}: +${(spec.memoryDelta.heapUsed / 1024 / 1024).toFixed(2)} MB`
).join('\n')}
`;

      const benchmarkPath = path.join(projectRoot, 'cypress', 'reports', 'benchmark-report.txt');
      fs.writeFileSync(benchmarkPath, benchmark);
      
      console.log(`Relatório de benchmark gerado: ${benchmarkPath}`);
      
    } catch (error) {
      console.error('Erro ao gerar relatório de benchmark:', error.message);
    }
  }
  /**
   * Limpa todos os relatórios antigos (versão melhorada)
   */
  static cleanOldReports(projectRoot) {
    const reportsPath = path.join(projectRoot, 'cypress', 'reports');
    
    try {
      console.log('Iniciando limpeza completa de relatórios antigos...');
      
      // 1. Limpar JSONs do Mochawesome
      const mochawesomePath = path.join(reportsPath, 'mochawesome');
      if (fs.existsSync(mochawesomePath)) {
        const jsonFiles = fs.readdirSync(mochawesomePath).filter(file => file.endsWith('.json'));
        console.log(`   Removendo ${jsonFiles.length} arquivos JSON do mochawesome...`);
        
        jsonFiles.forEach(file => {
          const filePath = path.join(mochawesomePath, file);
          fs.unlinkSync(filePath);
        });
      }
      
      // 2. Limpar relatórios HTML antigos (manter apenas o mais recente)
      const htmlFiles = ['merged.html', 'advanced-report.html'];
      htmlFiles.forEach(htmlFile => {
        const htmlPath = path.join(reportsPath, htmlFile);
        if (fs.existsSync(htmlPath)) {
          console.log(`   Removendo relatório HTML antigo: ${htmlFile}`);
          fs.unlinkSync(htmlPath);
        }
      });
      
      // 3. Limpar relatórios do cypress
      const cypressReportsPath = path.join(reportsPath, 'cypress', 'reports');
      if (fs.existsSync(cypressReportsPath)) {
        const cypressHtml = path.join(cypressReportsPath, 'merged.html');
        if (fs.existsSync(cypressHtml)) {
          console.log('   Removendo merged.html do cypress...');
          fs.unlinkSync(cypressHtml);
        }
      }
      
      // 4. Limpar arquivos de análise antigos
      const analysisFiles = ['test-analysis.json', 'benchmark-report.txt', 'analysis-report.txt'];
      analysisFiles.forEach(file => {
        const filePath = path.join(reportsPath, file);
        if (fs.existsSync(filePath)) {
          console.log(`   Removendo arquivo de análise: ${file}`);
          fs.unlinkSync(filePath);
        }
      });
      
      console.log('Limpeza completa de relatórios concluída!');
      
    } catch (error) {
      console.log('Erro durante a limpeza de relatórios:', error.message);
    }
  }

  /**
   * Limpa arquivos temporários residuais
   */
  static cleanTempFiles() {
    try {
      const projectRoot = process.cwd();
      
      // Padrões de arquivos temporários para remover
      const tempPatterns = [
        'temp_*.json',
        '*.temp',
        'temp_spec_metrics_*.json'
      ];
      
      // Verificar na raiz do projeto
      const rootFiles = fs.readdirSync(projectRoot);
      rootFiles.forEach(file => {
        if (file.startsWith('temp_') && file.endsWith('.json')) {
          const filePath = path.join(projectRoot, file);
          console.log(`   Removendo arquivo temporário: ${file}`);
          fs.unlinkSync(filePath);
        }
      });
      
      // Verificar na pasta cypress/reports
      const reportsPath = path.join(projectRoot, 'cypress', 'reports');
      if (fs.existsSync(reportsPath)) {
        const reportFiles = fs.readdirSync(reportsPath);
        reportFiles.forEach(file => {
          if (file.startsWith('temp_') || file.endsWith('.temp')) {
            const filePath = path.join(reportsPath, file);
            console.log(`   Removendo arquivo temporário: ${file}`);
            fs.unlinkSync(filePath);
          }
        });
      }
      
    } catch (error) {
      console.log('Aviso: Erro na limpeza de arquivos temporários:', error.message);
    }
  }

  /**
   * Gera ID único para esta execução
   */
  static generateExecutionId() {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:-]/g, '').replace(/\..+/, '');
    const random = Math.random().toString(36).substring(2, 8);
    return `exec_${timestamp}_${random}`;
  }

  /**
   * Limpa arquivos JSON antigos da pasta mochawesome
   */
  static cleanOldMochawesomeReports(projectRoot) {
    // Chama a nova função de limpeza completa
    this.cleanOldReports(projectRoot);
  }

  /**
   * Garante que a estrutura de diretórios necessária existe
   */
  static ensureDirectoryStructure(projectRoot) {
    const requiredDirs = [
      path.join(projectRoot, 'cypress', 'reports'),
      path.join(projectRoot, 'cypress', 'reports', 'mochawesome'),
      path.join(projectRoot, 'cypress', 'videos'),
      path.join(projectRoot, 'cypress', 'screenshots')
    ];

    requiredDirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }
}

module.exports = AdvancedMetrics;
