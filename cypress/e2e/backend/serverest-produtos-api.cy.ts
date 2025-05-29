import { DataFactory } from '../../support/utils/DataFactory';
import { ApiUtils } from '../../support/utils/ApiUtils'; // Importar ApiUtils

describe('Testes de API CRUD para Produtos no ServeRest', () => {
    let produtoCriado: any;
    let token: string;    before(function() {
        // Realiza o login uma vez antes de todos os testes do bloco
        cy.loginApiServeRest().then((authToken) => {
            token = authToken;
            // Armazenar o token no localStorage usando cy.window
            cy.window().then((window) => {
                window.localStorage.setItem('token', token);
                Cypress.log({
                    name: 'LoginAPI',
                    message: 'Login realizado com sucesso e token armazenado no localStorage para testes de produtos.',
                });
            });
        });
    });

    beforeEach(function() {
        // Garantir que o token está no localStorage antes de cada teste
        cy.window().then((window) => {
            if (!window.localStorage.getItem('token') && token) {
                window.localStorage.setItem('token', token);
            }
            const currentToken = window.localStorage.getItem('token');
            Cypress.log({
                name: 'TokenCheck',
                message: `Token no localStorage: ${currentToken ? 'Presente' : 'Ausente'}`,
            });
        });    });    it('[POST] Deve cadastrar um novo produto com sucesso', function() {
        const novoProduto = DataFactory.gerarProdutoServeRest();
        
        // Garantir que temos um token válido
        cy.loginApiServeRest().then((token) => {
            expect(token, 'Token de login deve existir').to.exist;
            
            // Log para debug
            console.log('Token obtido:', token);
            console.log('Dados do produto:', novoProduto);
            
            // ESPERA IMPLÍCITA que resolve o problema de timing
            cy.wait(1000).then(() => {
                cy.request({
                    method: 'POST',
                    url: `${Cypress.env('apiUrl')}/produtos`,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    },
                    body: novoProduto,
                    failOnStatusCode: true  // Falhar se não for sucesso
                }).then((response) => {
                    console.log('Response status:', response.status);
                    console.log('Response body:', response.body);
                    
                    expect(response.status).to.eq(201);
                    expect(response.body).to.have.property('message', 'Cadastro realizado com sucesso');
                    expect(response.body).to.have.property('_id');
                    produtoCriado = { ...novoProduto, _id: response.body._id };
                    Cypress.log({
                        name: 'CreateProduto',
                        message: `Produto criado com sucesso: ${JSON.stringify(produtoCriado)}`,
                    });
                });
            });
        });
    });

    it('[GET] Deve listar um produto específico com sucesso', function() {
        if (!produtoCriado || !produtoCriado._id) {
            cy.log('ID do produto não definido, pulando teste de leitura de produto.');
            this.skip();
        }
        cy.apiRead(`/produtos/${produtoCriado._id}`).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('nome', produtoCriado.nome);
            expect(response.body).to.have.property('preco', produtoCriado.preco);
            expect(response.body).to.have.property('descricao', produtoCriado.descricao);
            expect(response.body).to.have.property('quantidade', produtoCriado.quantidade);
            Cypress.log({
                name: 'ReadProduto',
                message: `Produto lido: ${JSON.stringify(response.body)}`,
            });
        });
    });

    it('[PUT] Deve atualizar um produto existente com sucesso', function() {
        if (!produtoCriado || !produtoCriado._id) {
            cy.log('ID do produto não definido, pulando teste de atualização de produto.');
            this.skip();
        }
        const dadosAtualizados = DataFactory.gerarProdutoServeRest(); // Gera um novo conjunto de dados para atualização
          cy.apiUpdate(`/produtos/${produtoCriado._id}`, dadosAtualizados).then((response) => {            // BUG RELACIONADO AO COMPORTAMENTO INTERMITENTE: PUT /produtos/{_id} falha com 400
            // quando o produto foi criado na mesma sessão de testes. Este erro está relacionado
            // ao bug intermitente do POST mencionado acima. Quando o POST funciona, este PUT
            // frequentemente falha, sugerindo problemas de sincronização/cache na API ServeRest.
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('message', 'Registro alterado com sucesso');
            produtoCriado = { ...produtoCriado, ...dadosAtualizados }; // Atualiza a referência local
            Cypress.log({
                name: 'UpdateProduto',
                message: `Produto atualizado. Novos dados: ${JSON.stringify(dadosAtualizados)}`,
            });
        });
    });

    it('[GET] Deve verificar se o produto foi atualizado corretamente', function() {
        if (!produtoCriado || !produtoCriado._id) {
            cy.log('ID do produto não definido, pulando teste de verificação de atualização de produto.');
            this.skip();
        }
        cy.apiRead(`/produtos/${produtoCriado._id}`).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('nome', produtoCriado.nome);
            expect(response.body).to.have.property('preco', produtoCriado.preco);
            expect(response.body).to.have.property('descricao', produtoCriado.descricao);
            expect(response.body).to.have.property('quantidade', produtoCriado.quantidade);
            Cypress.log({
                name: 'VerifyUpdateProduto',
                message: `Verificação pós-atualização do produto: ${JSON.stringify(response.body)}`,
            });
        });
    });

    it('[DELETE] Deve excluir um produto existente com sucesso', function() {
        if (!produtoCriado || !produtoCriado._id) {
            cy.log('ID do produto não definido, pulando teste de exclusão de produto.');
            this.skip();
        }
        cy.apiDelete(`/produtos/${produtoCriado._id}`).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('message', 'Registro excluído com sucesso');
            Cypress.log({
                name: 'DeleteProduto',
                message: `Produto excluído: ID ${produtoCriado._id}`,
            });
        });
    });

    it('[GET] Deve verificar se o produto foi excluído (não deve ser encontrado)', function() {
        if (!produtoCriado || !produtoCriado._id) {
            cy.log('ID do produto não definido, pulando teste de verificação de exclusão de produto.');
            this.skip();
        }        cy.apiRead(`/produtos/${produtoCriado._id}`, { failOnStatusCode: false }).then((response) => {
            // Quando um produto é excluído, a API ServeRest retorna status 400 com "Produto não encontrado"
            expect(response.status).to.eq(400); // Status correto para produto não encontrado
            expect(response.body).to.have.property('message', 'Produto não encontrado');
            Cypress.log({
                name: 'VerifyDeleteProduto',
                message: `Verificação pós-exclusão confirmada - produto ID ${produtoCriado._id} não encontrado (Status ${response.status})`,
            });
        });
    });

    it('[GET] Deve listar todos os produtos com sucesso', function() {
        cy.apiList('/produtos').then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('quantidade');
            expect(response.body).to.have.property('produtos').and.to.be.an('array');
            Cypress.log({
                name: 'ListProdutos',
                message: `Listagem de produtos: ${response.body.quantidade} produtos encontrados.`,
            });
        });
    });

    // Teste de tentativa de cadastrar produto com nome já existente (se aplicável pela API)
    // A API ServeRest permite produtos com nomes duplicados, então este teste pode não ser relevante
    // ou precisaria de uma lógica diferente para validação de unicidade, se houvesse.
    // Por ora, vamos focar no fluxo CRUD básico.

    // Testes adicionais utilizando ApiUtils
    ApiUtils.testarAutenticacaoEndpoint('/produtos', 'GET');
    ApiUtils.testarAutenticacaoEndpoint('/produtos', 'POST');
    ApiUtils.testarAutenticacaoEndpoint('/produtos/{_id}', 'GET');
    ApiUtils.testarAutenticacaoEndpoint('/produtos/{_id}', 'PUT');
    ApiUtils.testarAutenticacaoEndpoint('/produtos/{_id}', 'DELETE');

    ApiUtils.testarPaginacao('/produtos', 'produtos');

    // Exemplo de teste de busca para produtos por nome
    // Similar aos usuários, para este teste ser mais robusto, seria ideal criar um produto específico antes.
    // Testaremos com um nome genérico.
    ApiUtils.testarBusca('/produtos', { nome: 'Logitech MX Vertical' }, 'produtos', (resultados) => {
        if (resultados.length > 0) {
            resultados.forEach(produto => {
                expect(produto.nome).to.include('Logitech');
            });
        } else {
            cy.log('Busca por "Logitech MX Vertical" não retornou resultados, o que é aceitável.');
        }
    });
    
    // Teste de busca por preço (exemplo, pode precisar de ajuste conforme a API suporta)
    // A API ServeRest não parece suportar busca por faixa de preço diretamente via query params simples como /produtos?preco=100
    // Ela suporta _id, nome, descricao, quantidade, preco. Vamos testar com um preço exato.
    // Para um teste mais efetivo, seria bom criar um produto com preço conhecido.
    ApiUtils.testarBusca('/produtos', { preco: 150 }, 'produtos', (resultados) => {
        if (resultados.length > 0) {
            resultados.forEach(produto => {
                expect(produto.preco).to.eq(150);
            });
        } else {
            cy.log('Busca por produtos com preço 150 não retornou resultados, o que é aceitável.');
        }
    });

    // Teste de performance para listagem de produtos
    ApiUtils.testarPerformance('/produtos', 'GET', 2500);
});
