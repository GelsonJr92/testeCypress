import { DataFactory } from '../../support/utils/DataFactory';

describe('Testes de API CRUD para Carrinhos no ServeRest', () => {
    describe('Ciclo de vida do Carrinho - Cancelar Compra', () => {
        it('[POST] /carrinhos - Deve adicionar produtos ao carrinho com sucesso', function () {
            // Fazer login para este teste específico
            cy.loginApiServeRest().then((token) => {
                cy.window().then((window) => {
                    window.localStorage.setItem('token', token);
                });
                
                // Criar produto específico para este teste
                const novoProduto = DataFactory.gerarProdutoServeRest();
                
                cy.apiCreate('/produtos', novoProduto).then((produtoResponse) => {
                    expect(produtoResponse.status).to.eq(201);
                    const produtoId = produtoResponse.body._id;
                    
                    // Criar carrinho com o produto criado
                    const carrinhoPayload = {
                        produtos: [{ idProduto: produtoId, quantidade: 2 }]
                    };
                    
                    cy.apiCreate('/carrinhos', carrinhoPayload).then((response) => {
                        expect(response.status).to.eq(201);
                        expect(response.body).to.have.property('message', 'Cadastro realizado com sucesso');
                        
                        // Limpeza: cancelar compra e deletar produto
                        cy.apiDelete('/carrinhos/cancelar-compra', { failOnStatusCode: false });
                        cy.apiDelete(`/produtos/${produtoId}`, { failOnStatusCode: false });
                    });
                });
            });
        });

        it('[GET] /carrinhos - Deve listar carrinhos', function () {
            // Fazer login para este teste específico
            cy.loginApiServeRest().then((token) => {
                cy.window().then((window) => {
                    window.localStorage.setItem('token', token);
                });
                
                // Criar produto específico para este teste
                const novoProduto = DataFactory.gerarProdutoServeRest();
                
                cy.apiCreate('/produtos', novoProduto).then((produtoResponse) => {
                    expect(produtoResponse.status).to.eq(201);
                    const produtoId = produtoResponse.body._id;
                    
                    // Criar carrinho para ter algo para listar
                    const carrinhoPayload = { 
                        produtos: [{ idProduto: produtoId, quantidade: 1 }] 
                    };
                    
                    cy.apiCreate('/carrinhos', carrinhoPayload).then(() => {
                        cy.apiList('/carrinhos').then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('carrinhos').and.to.be.an('array');
                            
                            // Limpeza: cancelar compra e deletar produto
                            cy.apiDelete('/carrinhos/cancelar-compra', { failOnStatusCode: false });
                            cy.apiDelete(`/produtos/${produtoId}`, { failOnStatusCode: false });
                        });
                    });
                });
            });
        });

        it('[DELETE] /carrinhos/cancelar-compra - Deve cancelar compra', function () {
            // Fazer login para este teste específico
            cy.loginApiServeRest().then((token) => {
                cy.window().then((window) => {
                    window.localStorage.setItem('token', token);
                });
                
                // Criar produto específico para este teste
                const novoProduto = DataFactory.gerarProdutoServeRest();
                
                cy.apiCreate('/produtos', novoProduto).then((produtoResponse) => {
                    expect(produtoResponse.status).to.eq(201);
                    const produtoId = produtoResponse.body._id;
                    
                    // Criar carrinho para poder cancelar
                    const carrinhoPayload = { 
                        produtos: [{ idProduto: produtoId, quantidade: 1 }] 
                    };
                    
                    cy.apiCreate('/carrinhos', carrinhoPayload).then((carrinhoResponse) => {
                        expect(carrinhoResponse.status).to.eq(201);
                        
                        // Cancelar a compra
                        cy.apiDelete('/carrinhos/cancelar-compra').then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', 'Registro excluído com sucesso. Estoque dos produtos reabastecido');
                            
                            // Limpeza: deletar produto
                            cy.apiDelete(`/produtos/${produtoId}`, { failOnStatusCode: false });
                        });
                    });
                });
            });
        });
    });
});
