/**
 * Task para gerenciar credenciais dinâmicas globais
 * Extraído do cypress.config.ts para melhor organização
 */
const axios = require('axios');
const fs = require('fs');
const path = require('path');

export const ensureDynamicCredentials = (args: any) => {
  const credentialsFile = path.resolve('cypress/fixtures/session-credentials.json');
  
  // Verificar se as credenciais já existem e não expiraram
  if (fs.existsSync(credentialsFile)) {
    try {
      const existingCredentials = JSON.parse(fs.readFileSync(credentialsFile, 'utf8'));
      
      // Verificar TTL - credenciais expiram após 30 minutos
      const TTL_MINUTES = 30;
      const creationTime = new Date(existingCredentials.admin.createdAt).getTime();
      const currentTime = Date.now();
      const timeElapsed = (currentTime - creationTime) / (1000 * 60); // em minutos
      
      if (timeElapsed < TTL_MINUTES) {
        console.log(`Credenciais da sessão encontradas e válidas (${Math.round(timeElapsed)}min), reutilizando...`);
        return existingCredentials;
      } else {
        console.log(`⏰ Credenciais da sessão expiraram (${Math.round(timeElapsed)}min > ${TTL_MINUTES}min), criando novas...`);
        fs.unlinkSync(credentialsFile);
      }
    } catch (error) {
      console.log('Erro ao ler credenciais da sessão, criando novas...');
      fs.unlinkSync(credentialsFile);
    }
  }
  
  console.log('Criando novas credenciais dinâmicas para a sessão...');
  
  // Gerar dados mais únicos para evitar conflitos
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substr(2, 8);
  const sessionId = `${timestamp}_${randomId}`;
  
  // Criar credenciais admin
  const adminData = {
    nome: `Admin_Dinamico_${sessionId}`,
    email: `admin.dinamico.${sessionId}@exemplo.com`,
    password: `AdminDin${randomId}${timestamp.toString().slice(-4)}!`,
    administrador: 'true'
  };
  
  return axios.post('https://serverest.dev/usuarios', adminData)
    .then((adminResponse: any) => {
      console.log(`Admin criado com sucesso: ${adminData.email}`);
      const adminCredentials = {
        id: adminResponse.data._id,
        email: adminData.email,
        password: adminData.password,
        nome: adminData.nome,
        isAdmin: true,
        createdAt: new Date().toISOString()
      };
      
      // Criar credenciais user com dados únicos
      const userTimestamp = Date.now() + 500;
      const userRandomId = Math.random().toString(36).substr(2, 8);
      const userSessionId = `${userTimestamp}_${userRandomId}`;
      
      const userData = {
        nome: `User_Dinamico_${userSessionId}`,
        email: `user.dinamico.${userSessionId}@exemplo.com`,
        password: `UserDin${userRandomId}${userTimestamp.toString().slice(-4)}!`,
        administrador: 'false'
      };
      
      return axios.post('https://serverest.dev/usuarios', userData)
        .then((userResponse: any) => {
          const userCredentials = {
            id: userResponse.data._id,
            email: userData.email,
            password: userData.password,
            nome: userData.nome,
            isAdmin: false,
            createdAt: new Date().toISOString()
          };
          
          const sessionCredentials = {
            admin: adminCredentials,
            user: userCredentials,
            sessionId: Date.now()
          };
          
          try {
            fs.writeFileSync(credentialsFile, JSON.stringify(sessionCredentials, null, 2));
            console.log(`Credenciais da sessão criadas - Admin: ${adminCredentials.email}, User: ${userCredentials.email}`);
            return sessionCredentials;          } catch (error: any) {
            console.log('Erro ao salvar credenciais da sessão:', error.message);
            return sessionCredentials;
          }
        })
        .catch((error: any) => {
          console.error('Erro detalhado ao criar usuário regular:');
          console.error('   - Dados enviados:', JSON.stringify(userData, null, 2));
          console.error('   - Status:', error.response?.status);
          console.error('   - Resposta da API:', JSON.stringify(error.response?.data, null, 2));
          throw error;
        });
    })
    .catch((error: any) => {
      console.error('Erro detalhado ao criar usuário admin:');
      console.error('   - Dados enviados:', JSON.stringify(adminData, null, 2));
      console.error('   - Status:', error.response?.status);
      console.error('   - Resposta da API:', JSON.stringify(error.response?.data, null, 2));
      throw error;
    });
};

export const readFileIfExists = (filePath: string) => {
  const fullPath = path.resolve(filePath);
  
  try {
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      return JSON.parse(content);
    }
    return null;  } catch (error: any) {
    console.log(`Erro ao ler arquivo ${filePath}:`, error.message);
    return null;
  }
};

export const deleteFile = (filePath: string) => {
  const fullPath = path.resolve(filePath);
  
  try {
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`Arquivo removido: ${filePath}`);
      return true;
    }
    return false;  } catch (error: any) {
    console.log(`Erro ao remover arquivo ${filePath}:`, error.message);
    return false;
  }
};
