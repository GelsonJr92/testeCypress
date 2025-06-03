const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
  const reportDir = 'cypress/reports/mochawesome';
  const jsonsDir = 'cypress/reports/mochawesome/.jsons';
  
  if (!fs.existsSync(reportDir)) {
    console.log('AVISO: Diretório de relatórios não existe. Criando...');
    fs.mkdirSync(reportDir, {recursive: true});
  }
  
  let jsonFiles = [];
  let merged = false;
  
  // Primeiro, verifica na pasta .jsons
  if (fs.existsSync(jsonsDir)) {
    jsonFiles = fs.readdirSync(jsonsDir).filter(f => f.endsWith('.json'));
    if (jsonFiles.length > 0) {
      console.log('Fazendo merge de', jsonFiles.length, 'arquivo(s) de relatório...');
      execSync('npx mochawesome-merge "cypress/reports/mochawesome/.jsons/*.json" -o cypress/reports/merged.json', {stdio: 'inherit'});
      merged = true;
    }
  }
  
  // Se não encontrou na .jsons, procura na pasta mochawesome
  if (!merged) {
    jsonFiles = fs.existsSync(reportDir) ? fs.readdirSync(reportDir).filter(f => f.endsWith('.json')) : [];
    if (jsonFiles.length > 0) {
      console.log('Fazendo merge de', jsonFiles.length, 'arquivo(s) de relatório...');
      execSync('npx mochawesome-merge "cypress/reports/mochawesome/*.json" -o cypress/reports/merged.json', {stdio: 'inherit'});
    } else {
      console.log('AVISO: Nenhum arquivo de relatório encontrado para merge. Criando arquivo vazio...');
      const emptyReport = {
        stats: {
          suites: 0,
          tests: 0,
          passes: 0,
          pending: 0,
          failures: 0,
          start: new Date().toISOString(),
          end: new Date().toISOString(),
          duration: 0,
          testsRegistered: 0,
          passPercent: 0,
          pendingPercent: 0,
          other: 0,
          hasOther: false,
          skipped: 0,
          hasSkipped: false
        },
        results: [],
        meta: {
          mocha: {version: '9.0.0'},
          mochawesome: {version: '7.1.3', options: {}},
          marge: {version: '6.2.0', options: {}}
        }
      };
      fs.writeFileSync('cypress/reports/merged.json', JSON.stringify(emptyReport, null, 2));
    }
  }
} catch(e) {
  console.log('ERRO no merge:', e.message);
  process.exit(1);
}
