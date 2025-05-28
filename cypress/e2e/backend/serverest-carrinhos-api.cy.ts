import { DataFactory } from '../../support/utils/DataFactory';

describe('Testes de API CRUD para Carrinhos no ServeRest', () => {
    let produtoParaCarrinho: any;
    let carrinhoCriadoInfo: any;
    let token: string;

    before(function () {
        cy.loginApiServeRest().then((authToken) => {
            token = authToken;
            cy.window().then((window) => {
                window.localStorage.setItem('token', token);
            });
        });
    });    beforeEach(function () {
        cy.window().then((window) => {
            if (!window.localStorage.getItem('token') && token) {
                window.localStorage.setItem('token', token);
            }
        });

        // Espera implícita para problemas de timing
        cy.wait(500);
        cy.apiDelete('/carrinhos/cancelar-compra', { failOnStatusCode: false });
        cy.wait(300);

        // Estratégia simplificada: sempre tentar usar produto existente primeiro
        cy.apiList('/produtos').then((listaResponse) => {
            if (listaResponse.status === 200 && listaResponse.body.produtos && listaResponse.body.produtos.length > 0) {
                // Usar produto existente
                produtoParaCarrinho = listaResponse.body.produtos[0];
                cy.log('Usando produto existente para carrinho');
            } else {
                // Se não há produtos, criar um com espera implícita (mesma estratégia que funcionou)
                cy.wait(1000);
                const novoProduto = DataFactory.gerarProdutoServeRest();
                cy.request({
                    method: 'POST',
                    url: `${Cypress.env('apiUrl')}/produtos`,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    },
                    body: novoProduto,
                    failOnStatusCode: true  // Agora deve funcionar com preços inteiros
                }).then((response) => {
                    expect(response.status).to.eq(201);
                    produtoParaCarrinho = { ...novoProduto, _id: response.body._id };
                    cy.log('Produto criado com sucesso para carrinho');
                });
            }
        });
    });

    afterEach(function() {
        cy.apiDelete('/carrinhos/cancelar-compra', { failOnStatusCode: false });
        if (produtoParaCarrinho && produtoParaCarrinho._id) {
            cy.apiDelete(`/produtos/${produtoParaCarrinho._id}`, { failOnStatusCode: false });
        }
    });

    describe('Ciclo de vida do Carrinho - Cancelar Compra', () => {
        it('[POST] /carrinhos - Deve adicionar produtos ao carrinho com sucesso', function () {
            const carrinhoPayload = {
                produtos: [{ idProduto: produtoParaCarrinho._id, quantidade: 2 }]
            };
            cy.apiCreate('/carrinhos', carrinhoPayload).then((response) => {
                expect(response.status).to.eq(201);
                expect(response.body).to.have.property('message', 'Cadastro realizado com sucesso');
            });
        });

        it('[GET] /carrinhos - Deve listar carrinhos', function () {
            const carrinhoPayload = { produtos: [{ idProduto: produtoParaCarrinho._id, quantidade: 1 }] };
            cy.apiCreate('/carrinhos', carrinhoPayload).then(() => {
                cy.apiList('/carrinhos').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('carrinhos').and.to.be.an('array');
                    if (response.body.carrinhos.length > 0) {
                        const carrinho = response.body.carrinhos[0];
                        expect(carrinho).to.have.property('_id');
                        carrinhoCriadoInfo = { carrinhoId: carrinho._id };
                    }
                });
            });
        });

        it('[DELETE] /carrinhos/cancelar-compra - Deve cancelar compra', function () {
            const carrinhoPayload = { produtos: [{ idProduto: produtoParaCarrinho._id, quantidade: 1 }] };
            cy.apiCreate('/carrinhos', carrinhoPayload).then(() => {
                cy.apiDelete('/carrinhos/cancelar-compra').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', 'Registro excluído com sucesso. Estoque dos produtos reabastecido');
                });
            });
        });
    });
});
