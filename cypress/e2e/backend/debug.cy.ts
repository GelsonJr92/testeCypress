import { DataFactory } from '../../support/utils/DataFactory';

interface DynamicCredentials {
  id: string;
  email: string;
  password: string;
  nome: string;
  isAdmin: boolean;
  createdAt: string;
}

describe('Setup: Credenciais Dinâmicas (Memory Only)', () => {
  const baseUrl = 'https://serverest.dev';
  const generateRandomString = (): string => Math.random().toString(36).substring(2, 15);
  
  before(() => {
    // Limpar variáveis de ambiente de execuções anteriores
    Cypress.env('DYNAMIC_ADMIN_CREDENTIALS', null);
    Cypress.env('DYNAMIC_USER_CREDENTIALS', null);
    cy.log('Variáveis de ambiente limpos para nova execução');
  });
  const createUserAndStoreInMemory = (userType: 'admin' | 'regular', email: string, password: string): Cypress.Chainable<DynamicCredentials> => {
    return cy.request({
      method: 'POST',
      url: `${baseUrl}/usuarios`,
      body: {
        nome: userType === 'admin' ? 'Admin QA Dynamic' : 'User QA Dynamic',
        email: email,
        password: password,
        administrador: userType === 'admin' ? 'true' : 'false'
      },
      failOnStatusCode: false
    }).then((response): Cypress.Chainable<DynamicCredentials> => {
      if (response.status === 201) {
        cy.log(`${userType} criado com sucesso: ${email}`);
        
        // Salva credenciais APENAS em memória (Cypress.env)
        const envKey = userType === 'admin' ? 'DYNAMIC_ADMIN_CREDENTIALS' : 'DYNAMIC_USER_CREDENTIALS';
        const credentials: DynamicCredentials = {
          id: response.body._id,
          email: email,
          password: password,
          nome: response.body.nome,
          isAdmin: userType === 'admin',
          createdAt: new Date().toISOString()
        };
        
        Cypress.env(envKey, JSON.stringify(credentials));
        cy.log(`Credenciais ${userType} salvas em memória (${envKey})`);
        
        return cy.wrap(credentials);
      } else if (response.status === 400 && response.body.message?.includes('E-mail já está sendo usado')) {
        cy.log(`Email ${email} já existe, tentando novo email...`);
        const newEmail = `${userType}_${generateRandomString()}@qa.com`;
        return createUserAndStoreInMemory(userType, newEmail, password);
      } else {
        throw new Error(`Falha ao criar ${userType}: ${response.status} - ${JSON.stringify(response.body)}`);
      }
    });
  };

  it('[SETUP] Deve criar usuário administrador dinâmico em memória', () => {
    const adminEmail = `admin_${generateRandomString()}@qa.com`;
    const adminPassword = `admin123_${generateRandomString()}`;
    
    cy.log('Criando usuário administrador dinâmico...');
    
    createUserAndStoreInMemory('admin', adminEmail, adminPassword).then((credentials: DynamicCredentials) => {
      expect(credentials.email).to.include('admin_');
      expect(credentials.password).to.include('admin123_');
      expect(credentials.isAdmin).to.be.true;
      expect(credentials.id).to.exist;
      
      // Verifica se foi salvo corretamente em memória
      const savedCredentials = JSON.parse(Cypress.env('DYNAMIC_ADMIN_CREDENTIALS') || '{}');
      expect(savedCredentials.email).to.equal(credentials.email);
      expect(savedCredentials.password).to.equal(credentials.password);
      expect(savedCredentials.id).to.equal(credentials.id);
        cy.log(`Admin criado e salvo em memória: ${credentials.email}`);
      cy.log(`ID: ${credentials.id}`);
    });
  });

  it('[SETUP] Deve criar usuário regular dinâmico em memória', () => {
    const userEmail = `user_${generateRandomString()}@qa.com`;
    const userPassword = `user123_${generateRandomString()}`;
    
    cy.log('Criando usuário regular dinâmico...');
    
    createUserAndStoreInMemory('regular', userEmail, userPassword).then((credentials: DynamicCredentials) => {
      expect(credentials.email).to.include('user_');
      expect(credentials.password).to.include('user123_');
      expect(credentials.isAdmin).to.be.false;
      expect(credentials.id).to.exist;
      
      // Verifica se foi salvo corretamente em memória
      const savedCredentials = JSON.parse(Cypress.env('DYNAMIC_USER_CREDENTIALS') || '{}');
      expect(savedCredentials.email).to.equal(credentials.email);
      expect(savedCredentials.password).to.equal(credentials.password);
      expect(savedCredentials.id).to.equal(credentials.id);
        cy.log(`Usuário regular criado e salvo em memória: ${credentials.email}`);
      cy.log(`ID: ${credentials.id}`);
    });
  });

  it('[VALIDATION] Deve validar que as credenciais dinâmicas funcionam', () => {
    cy.log('Validando credenciais dinâmicas...');
    
    // Recuperar credenciais da memória
    const adminCreds = JSON.parse(Cypress.env('DYNAMIC_ADMIN_CREDENTIALS') || '{}');
    const userCreds = JSON.parse(Cypress.env('DYNAMIC_USER_CREDENTIALS') || '{}');
    
    expect(adminCreds.email).to.exist;
    expect(userCreds.email).to.exist;
    
    // Testar login do admin
    cy.log('Testando login do admin dinâmico...');
    cy.request({
      method: 'POST',
      url: `${baseUrl}/login`,
      body: {
        email: adminCreds.email,
        password: adminCreds.password
      }
    }).then((adminLogin) => {
      expect(adminLogin.status).to.eq(200);
      expect(adminLogin.body.authorization).to.exist;
      cy.log('Login admin validado com sucesso');
      
      // Testar login do usuário regular
      cy.log('Testando login do usuário regular...');
      cy.request({
        method: 'POST',
        url: `${baseUrl}/login`,
        body: {
          email: userCreds.email,
          password: userCreds.password
        }
      }).then((userLogin) => {
        expect(userLogin.status).to.eq(200);
        expect(userLogin.body.authorization).to.exist;
        cy.log('Login usuário regular validado com sucesso');
        cy.log('TODAS AS CREDENCIAIS DINÂMICAS FUNCIONANDO!');
        cy.log('Credenciais disponíveis em memória para todos os testes');
      });
    });
  });
});
