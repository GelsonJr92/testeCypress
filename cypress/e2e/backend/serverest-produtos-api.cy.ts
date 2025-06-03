import { DataFactory } from '../../support/utils/DataFactory';
import { ApiUtils } from '../../support/utils/ApiUtils';

describe('Testes de API CRUD para Produtos no ServeRest', () => {
    let produtoCriado: any;

    beforeEach(function() {
        // Fazer login com credenciais dinâmicas antes de cada teste
        cy.loginApiServeRest('admin');
    });

    it('[POST] Deve cadastrar um novo produto com sucesso', function() {
        const novoProduto = DataFactory.gerarProdutoServeRest();
          cy.apiCreate('/produtos', novoProduto).then((response) => {
            expect(response.status).to.eq(201);
            expect(response.body).to.have.property('message', 'Cadastro realizado com sucesso');
            expect(response.body).to.have.property('_id');
            produtoCriado = { ...novoProduto, _id: response.body._id };
        });
    });

    it('[GET] Deve listar um produto específico com sucesso', function() {
        if (!produtoCriado || !produtoCriado._id) {
            cy.log('ID do produto não definido, pulando teste de leitura de produto.');
            this.skip();
        }        cy.apiRead(`/produtos/${produtoCriado._id}`).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('nome', produtoCriado.nome);
            expect(response.body).to.have.property('preco', produtoCriado.preco);
            expect(response.body).to.have.property('descricao', produtoCriado.descricao);
            expect(response.body).to.have.property('quantidade', produtoCriado.quantidade);
        });
    });    it('[PUT] Deve atualizar um produto existente com sucesso', function() {
        if (!produtoCriado || !produtoCriado._id) {
            cy.log('ID do produto não definido, pulando teste de atualização de produto.');
            this.skip();
        }
        const dadosAtualizados = DataFactory.gerarProdutoServeRest(); // Gera um novo conjunto de dados para atualização
          cy.apiUpdate(`/produtos/${produtoCriado._id}`, dadosAtualizados).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('message', 'Registro alterado com sucesso');
            produtoCriado = { ...produtoCriado, ...dadosAtualizados };
        });
    });

    it('[GET] Deve verificar se o produto foi atualizado corretamente', function() {
        if (!produtoCriado || !produtoCriado._id) {
            cy.log('ID do produto não definido, pulando teste de verificação de atualização de produto.');
            this.skip();
        }        cy.apiRead(`/produtos/${produtoCriado._id}`).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('nome', produtoCriado.nome);
            expect(response.body).to.have.property('preco', produtoCriado.preco);
            expect(response.body).to.have.property('descricao', produtoCriado.descricao);
            expect(response.body).to.have.property('quantidade', produtoCriado.quantidade);
        });
    });

    it('[DELETE] Deve excluir um produto existente com sucesso', function() {
        if (!produtoCriado || !produtoCriado._id) {
            cy.log('ID do produto não definido, pulando teste de exclusão de produto.');
            this.skip();
        }        cy.apiDelete(`/produtos/${produtoCriado._id}`).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('message', 'Registro excluído com sucesso');
        });
    });    it('[GET] Deve verificar se o produto foi excluído (não deve ser encontrado)', function() {
        if (!produtoCriado || !produtoCriado._id) {
            cy.log('ID do produto não definido, pulando teste de verificação de exclusão de produto.');
            this.skip();
        }
          cy.apiRead(`/produtos/${produtoCriado._id}`, { failOnStatusCode: false }).then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property('message', 'Produto não encontrado');
        });
    });

    it('[GET] Deve listar todos os produtos com sucesso', function() {        cy.apiList('/produtos').then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('quantidade');
            expect(response.body).to.have.property('produtos').and.to.be.an('array');
        });
    });

    // Teste de tentativa de cadastrar produto com nome já existente (se aplicável pela API)
    // A API ServeRest permite produtos com nomes duplicados, então este teste pode não ser relevante
    // ou precisaria de uma lógica diferente para validação de unicidade, se houvesse.
    // Por ora, vamos focar no fluxo CRUD básico.    // Testes adicionais com ApiUtils
    ApiUtils.testarAutenticacaoEndpoint('/produtos', 'GET');
    ApiUtils.testarAutenticacaoEndpoint('/produtos', 'POST');
    ApiUtils.testarAutenticacaoEndpoint('/produtos/{_id}', 'GET');
    ApiUtils.testarAutenticacaoEndpoint('/produtos/{_id}', 'PUT');
    ApiUtils.testarAutenticacaoEndpoint('/produtos/{_id}', 'DELETE');

    ApiUtils.testarPaginacao('/produtos', 'produtos');

    ApiUtils.testarBusca('/produtos', { nome: 'Logitech MX Vertical' }, 'produtos', (resultados: any[]) => {
        if (resultados.length > 0) {
            resultados.forEach((produto: any) => {
                expect(produto.nome).to.include('Logitech');
            });
        }
    });
    
    ApiUtils.testarBusca('/produtos', { preco: 150 }, 'produtos', (resultados: any[]) => {
        if (resultados.length > 0) {
            resultados.forEach((produto: any) => {
                expect(produto.preco).to.eq(150);
            });
        }
    });

    ApiUtils.testarPerformance('/produtos', 'GET', 2500);
});
