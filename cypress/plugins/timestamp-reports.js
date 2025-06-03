const fs = require('fs');
const path = require('path');

function timestampReports(on, config) {
  
  function formatTimestamp() {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const aaaa = now.getFullYear();
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `${dd}-${mm}-${aaaa}-${hh}-${min}-${ss}`;
  }

  // Hook after each spec to rename the JSON file
  on('after:spec', (spec, results) => {
    try {
      const reportDir = path.join(config.projectRoot, 'cypress/reports/mochawesome/.jsons');
      
      if (!fs.existsSync(reportDir)) {
        return;
      }

      // Find the most recent mochawesome.json file
      const files = fs.readdirSync(reportDir)
        .filter(file => file.endsWith('.json'))
        .map(file => {
          const fullPath = path.join(reportDir, file);
          return {
            name: file,
            path: fullPath,
            time: fs.statSync(fullPath).mtime.getTime()
          };
        })
        .sort((a, b) => b.time - a.time);

      if (files.length > 0) {
        const mostRecent = files[0];
        const timestamp = formatTimestamp();
        const specName = path.basename(spec.name, '.cy.ts');
        const newName = `mochawesome-${specName}-${timestamp}.json`;
        const newPath = path.join(reportDir, newName);
        
        // Rename the file
        fs.renameSync(mostRecent.path, newPath);
        console.log(`📄 Relatório renomeado: ${newName}`);
      }
    } catch (error) {
      console.log('⚠️  Aviso: Erro ao renomear relatório:', error.message);
    }
  });

  // Also handle files that might be created during the run
  on('after:run', (results) => {
    try {
      const reportDir = path.join(config.projectRoot, 'cypress/reports/mochawesome/.jsons');
      
      if (!fs.existsSync(reportDir)) {
        return;
      }

      // Rename any remaining mochawesome.json files
      const files = fs.readdirSync(reportDir)
        .filter(file => file === 'mochawesome.json' || file.startsWith('mochawesome_'));

      files.forEach(file => {
        const oldPath = path.join(reportDir, file);
        const timestamp = formatTimestamp();
        const newName = `mochawesome-run-${timestamp}.json`;
        const newPath = path.join(reportDir, newName);
        
        if (!fs.existsSync(newPath)) {
          fs.renameSync(oldPath, newPath);
          console.log(`📄 Relatório final renomeado: ${newName}`);
        }
      });
    } catch (error) {
      console.log('⚠️  Aviso: Erro ao renomear relatórios finais:', error.message);
    }
  });
}

module.exports = timestampReports;
