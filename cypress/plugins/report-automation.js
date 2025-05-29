const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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
      });

      // 2. Gerar relatório HTML
      console.log('Gerando relatório HTML...');
      execSync('npx marge cypress/reports/merged.json --reportDir cypress/reports --inline', {
        cwd: config.projectRoot,
        stdio: 'inherit'
      });

      // 3. Mostrar estatísticas
      console.log('\nESTATÍSTICAS DOS TESTES:');
      console.log(`Testes executados: ${results.totalTests}`);
      console.log(`Testes passando: ${results.totalPassed}`);
      console.log(`Testes falhando: ${results.totalFailed}`);
      console.log(`Duração: ${Math.round(results.totalDuration / 1000)}s`);
      
      console.log('\nRelatório HTML gerado com sucesso!');
      console.log('Localização: cypress/reports/merged.html');
      
      // 4. Opcional: abrir automaticamente o relatório (comentado por padrão)
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

module.exports = setupReportAutomation;
