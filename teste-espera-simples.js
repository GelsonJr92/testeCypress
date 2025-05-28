// Teste simples para verificar se a espera implícita realmente resolve o bug
const { defineConfig } = require('cypress');

describe('Teste de Espera Simples', () => {
    it('Teste com espera implícita - sem retry/skip', function() {
        // Login primeiro
        cy.request({
            method: 'POST',
            url: 'https://serverest.dev/login',
            body: {
                email: 'fulano@qa.com',
                password: 'teste'
            }
        }).then((loginResponse) => {
            const token = loginResponse.body.authorization;
            
            // Espera implícita (como implementamos)
            cy.wait(1000);
            
            // Dados do produto
            const produto = {
                nome: `Produto Teste ${Date.now()}`,
                preco: Math.floor(Math.random() * 1000) + 100,
                descricao: 'Produto para teste de espera',
                quantidade: Math.floor(Math.random() * 100) + 1
            };
            
            // Tentar criar produto SEM retry/skip - só com a espera
            cy.request({
                method: 'POST',
                url: 'https://serverest.dev/produtos',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: produto,
                failOnStatusCode: true  // FALHAR se não for 201
            }).then((response) => {
                expect(response.status).to.eq(201);
                cy.log('SUCESSO: Espera implícita resolveu o problema!');
            });
        });
    });
});
