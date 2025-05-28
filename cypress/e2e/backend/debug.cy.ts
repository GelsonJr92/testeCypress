describe('Debug API', () => {
    it('[DEBUG] Deve testar o login e criação de usuário', () => {
        cy.log('🔍 INICIANDO DIAGNÓSTICO DO SISTEMA');
        cy.log(`📡 URL da API: ${Cypress.env('apiUrl')}`);
        
        // Primeiro, testar o login diretamente
        cy.log('1️⃣ TESTANDO LOGIN DIRETO VIA cy.request()');
        cy.request({
            method: 'POST',
            url: `${Cypress.env('apiUrl')}/login`,
            body: {
                email: 'fulano@qa.com',
                password: 'teste'
            }
        }).then((loginResponse) => {
            cy.log(`✅ Login direto - Status: ${loginResponse.status}`);
            cy.log(`📋 Response body: ${JSON.stringify(loginResponse.body)}`);
            
            const token = loginResponse.body.authorization;
            cy.log(`🔑 Token obtido diretamente: ${token}`);            
            // Agora testar com o comando customizado
            cy.log('2️⃣ TESTANDO LOGIN COM COMANDO CUSTOMIZADO');
            cy.loginApiServeRest().then((tokenCustom) => {
                cy.log(`🔑 Token do comando customizado: ${JSON.stringify(tokenCustom)}`);
                
                // Comparar tokens
                if (token === tokenCustom) {
                    cy.log('✅ TOKENS SÃO IDÊNTICOS - Comando funcionando corretamente');
                } else {
                    cy.log('❌ TOKENS DIFERENTES - Possível problema no comando');
                    cy.log(`Direto: ${token}`);
                    cy.log(`Customizado: ${tokenCustom}`);
                }
                
                // Testar criação usando ambos os tokens
                cy.log('3️⃣ TESTANDO CRIAÇÃO DE USUÁRIO');
                const novoUsuario = {
                    nome: 'Usuario Teste Debug',
                    email: `teste.debug.${Date.now()}@qa.com.br`,
                    password: 'senha123',
                    administrador: 'false'
                };
                
                cy.log(`👤 Dados do usuário: ${JSON.stringify(novoUsuario)}`);
                
                // Criação com token direto
                cy.log('4️⃣ CRIANDO USUÁRIO COM TOKEN DIRETO');
                cy.request({
                    method: 'POST',
                    url: `${Cypress.env('apiUrl')}/usuarios`,
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json'
                    },
                    body: novoUsuario,
                    failOnStatusCode: false
                }).then((response) => {
                    cy.log(`📊 Status da criação: ${response.status}`);
                    cy.log(`📝 Response: ${JSON.stringify(response.body)}`);
                    
                    if (response.status === 201) {
                        cy.log('✅ USUÁRIO CRIADO COM SUCESSO');
                        cy.log(`🆔 ID do usuário: ${response.body._id}`);
                        
                        // Limpar
                        cy.log('5️⃣ LIMPANDO DADOS DE TESTE');
                        cy.request({
                            method: 'DELETE',
                            url: `${Cypress.env('apiUrl')}/usuarios/${response.body._id}`,
                            headers: {
                                'Authorization': token,
                                'Content-Type': 'application/json'
                            }
                        }).then((deleteResponse) => {
                            cy.log(`🗑️ Limpeza - Status: ${deleteResponse.status}`);
                            cy.log('✅ DIAGNÓSTICO COMPLETO - TUDO FUNCIONANDO!');                        });
                    } else {
                        cy.log('❌ FALHA NA CRIAÇÃO DO USUÁRIO');
                        cy.log(`Erro: ${JSON.stringify(response.body)}`);
                    }
                });
            });
        });
    });
});
