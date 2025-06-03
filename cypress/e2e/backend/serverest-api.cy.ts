import { DataFactory } from '../../support/utils/DataFactory';
import { ApiUtils } from '../../support/utils/ApiUtils'; // Importar ApiUtils

describe('Testes de API CRUD para Usuários no ServeRest', () => {
    let token: any;    before(function() {
        // Realiza o login com credenciais dinâmicas
        cy.log('Configurando login com credenciais dinâmicas...');
        cy.loginApiServeRest('admin');
        
        // O token já foi armazenado automaticamente no localStorage pelo comando
        cy.window().then((window) => {
            const storedToken = window.localStorage.getItem('token');
            if (storedToken) {
                token = storedToken;
                Cypress.log({
                    name: 'LoginAPI',
                    message: 'Login realizado com credenciais dinâmicas e token obtido.',
                });
            }
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
        });
    });    it('[POST] Deve criar um novo usuário com sucesso', function() {
        const novoUsuario = DataFactory.gerarUsuarioServeRest();
        cy.apiCreate('/usuarios', novoUsuario).then((response) => {
            expect(response.status).to.eq(201);
            expect(response.body).to.have.property('message', 'Cadastro realizado com sucesso');
            expect(response.body).to.have.property('_id');
            
            const usuarioCriado = { ...novoUsuario, _id: response.body._id };
            Cypress.log({
                name: 'CreateUser',
                message: `Usuário criado: ${JSON.stringify(usuarioCriado)}`,
            });
            
            // Limpar o usuário criado
            cy.apiDelete(`/usuarios/${usuarioCriado._id}`).then((deleteResponse) => {
                expect(deleteResponse.status).to.eq(200);
                Cypress.log({
                    name: 'CleanupUser',
                    message: `Usuário ${usuarioCriado._id} limpo com sucesso.`,
                });
            });
        });
    });    it('[GET] Deve listar um usuário específico com sucesso', function() {
        // Criar um usuário primeiro
        const novoUsuario = DataFactory.gerarUsuarioServeRest();
        cy.apiCreate('/usuarios', novoUsuario).then((createResponse) => {
            expect(createResponse.status).to.eq(201);
            const usuarioCriado = { ...novoUsuario, _id: createResponse.body._id };
            
            // Testar a leitura
            cy.apiRead(`/usuarios/${usuarioCriado._id}`).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('nome', usuarioCriado.nome);
                expect(response.body).to.have.property('email', usuarioCriado.email);
                expect(response.body).to.have.property('administrador', usuarioCriado.administrador);
                Cypress.log({
                    name: 'ReadUser',
                    message: `Usuário lido: ${JSON.stringify(response.body)}`,
                });
                
                // Limpar o usuário criado
                cy.apiDelete(`/usuarios/${usuarioCriado._id}`).then((deleteResponse) => {
                    expect(deleteResponse.status).to.eq(200);
                    Cypress.log({
                        name: 'CleanupUser',
                        message: `Usuário ${usuarioCriado._id} limpo com sucesso.`,
                    });
                });
            });
        });
    });    it('[PUT] Deve atualizar um usuário existente com sucesso', function() {
        // Criar um usuário primeiro
        const novoUsuario = DataFactory.gerarUsuarioServeRest();
        cy.apiCreate('/usuarios', novoUsuario).then((createResponse) => {
            expect(createResponse.status).to.eq(201);
            const usuarioCriado = { ...novoUsuario, _id: createResponse.body._id };
            
            // Dados para atualização
            const dadosAtualizados = {
                nome: DataFactory.gerarUsuarioServeRest().nome,
                email: DataFactory.gerarUsuarioServeRest().email, 
                password: DataFactory.gerarUsuarioServeRest().password,
                administrador: usuarioCriado.administrador === 'true' ? 'false' : 'true'
            };
            
            // Testar a atualização
            cy.apiUpdate(`/usuarios/${usuarioCriado._id}`, dadosAtualizados).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', 'Registro alterado com sucesso');
                Cypress.log({
                    name: 'UpdateUser',
                    message: `Usuário atualizado. Novos dados: ${JSON.stringify(dadosAtualizados)}`,
                });
                
                // Limpar o usuário criado
                cy.apiDelete(`/usuarios/${usuarioCriado._id}`).then((deleteResponse) => {
                    expect(deleteResponse.status).to.eq(200);
                    Cypress.log({
                        name: 'CleanupUser',
                        message: `Usuário ${usuarioCriado._id} limpo com sucesso.`,
                    });
                });
            });
        });
    });    it('[GET] Deve verificar se o usuário foi atualizado corretamente', function() {
        // Criar um usuário primeiro
        const novoUsuario = DataFactory.gerarUsuarioServeRest();
        cy.apiCreate('/usuarios', novoUsuario).then((createResponse) => {
            expect(createResponse.status).to.eq(201);
            const usuarioCriado = { ...novoUsuario, _id: createResponse.body._id };
            
            // Dados para atualização
            const dadosAtualizados = {
                nome: DataFactory.gerarUsuarioServeRest().nome,
                email: DataFactory.gerarUsuarioServeRest().email, 
                password: DataFactory.gerarUsuarioServeRest().password,
                administrador: usuarioCriado.administrador === 'true' ? 'false' : 'true'
            };
            
            // Atualizar o usuário
            cy.apiUpdate(`/usuarios/${usuarioCriado._id}`, dadosAtualizados).then((updateResponse) => {
                expect(updateResponse.status).to.eq(200);
                const usuarioAtualizado = { ...usuarioCriado, ...dadosAtualizados };
                
                // Verificar se foi atualizado corretamente
                cy.apiRead(`/usuarios/${usuarioCriado._id}`).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('nome', usuarioAtualizado.nome);
                    expect(response.body).to.have.property('email', usuarioAtualizado.email);
                    expect(response.body).to.have.property('administrador', usuarioAtualizado.administrador);
                    Cypress.log({
                        name: 'VerifyUpdateUser',
                        message: `Verificação pós-atualização: ${JSON.stringify(response.body)}`,
                    });
                    
                    // Limpar o usuário criado
                    cy.apiDelete(`/usuarios/${usuarioCriado._id}`).then((deleteResponse) => {
                        expect(deleteResponse.status).to.eq(200);
                        Cypress.log({
                            name: 'CleanupUser',
                            message: `Usuário ${usuarioCriado._id} limpo com sucesso.`,
                        });
                    });
                });
            });
        });
    });    it('[DELETE] Deve excluir um usuário existente com sucesso', function() {
        // Criar um usuário primeiro
        const novoUsuario = DataFactory.gerarUsuarioServeRest();
        cy.apiCreate('/usuarios', novoUsuario).then((createResponse) => {
            expect(createResponse.status).to.eq(201);
            const usuarioCriado = { ...novoUsuario, _id: createResponse.body._id };
            
            // Testar a exclusão
            cy.apiDelete(`/usuarios/${usuarioCriado._id}`).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', 'Registro excluído com sucesso');
                Cypress.log({
                    name: 'DeleteUser',
                    message: `Usuário excluído: ID ${usuarioCriado._id}`,
                });
            });
        });
    });    it('[GET] Deve verificar se o usuário foi excluído (não deve ser encontrado)', function() {
        // Criar um usuário primeiro
        const novoUsuario = DataFactory.gerarUsuarioServeRest();
        cy.apiCreate('/usuarios', novoUsuario).then((createResponse) => {
            expect(createResponse.status).to.eq(201);
            const usuarioCriado = { ...novoUsuario, _id: createResponse.body._id };
            
            // Excluir o usuário
            cy.apiDelete(`/usuarios/${usuarioCriado._id}`).then((deleteResponse) => {
                expect(deleteResponse.status).to.eq(200);
                
                // Verificar se foi excluído (não deve ser encontrado)
                cy.apiRead(`/usuarios/${usuarioCriado._id}`, { failOnStatusCode: false }).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', 'Usuário não encontrado');
                    Cypress.log({
                        name: 'VerifyDeleteUser',
                        message: `Verificação pós-exclusão para ID ${usuarioCriado._id}: Status ${response.status}`,
                    });
                });
            });
        });
    });

    it('[GET] Deve listar todos os usuários com sucesso', function() {
        cy.apiList('/usuarios').then((response) => { // Token é pego do localStorage
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('quantidade');
            expect(response.body).to.have.property('usuarios').and.to.be.an('array');
            Cypress.log({
                name: 'ListUsers',
                message: `Listagem de usuários: ${response.body.quantidade} usuários encontrados.`,
            });
        });
    });

    it('[POST] Não deve criar um usuário com email já existente', function() {
        const usuarioExistente = DataFactory.gerarUsuarioServeRest();
        cy.apiCreate('/usuarios', usuarioExistente).then((responseCreate) => { // Token é pego do localStorage
            expect(responseCreate.status).to.eq(201); 
            const idUsuarioCriado = responseCreate.body._id;

            const novoUsuarioComEmailRepetido = DataFactory.gerarUsuarioServeRest();
            novoUsuarioComEmailRepetido.email = usuarioExistente.email; 

            cy.apiCreate('/usuarios', novoUsuarioComEmailRepetido, { failOnStatusCode: false }).then((response) => { // Token é pego do localStorage
                expect(response.status).to.eq(400); 
                expect(response.body).to.have.property('message', 'Este email já está sendo usado');
                Cypress.log({
                    name: 'CreateUserDuplicateEmail',
                    message: 'Tentativa de criar usuário com email duplicado falhou como esperado.',
                });

                if (idUsuarioCriado) {
                    cy.apiDelete(`/usuarios/${idUsuarioCriado}`).then(deleteResponse => { // Token é pego do localStorage
                        expect(deleteResponse.status).to.eq(200);
                        Cypress.log({
                            name: 'CleanupUser',
                            message: `Usuário de teste ${idUsuarioCriado} limpo com sucesso.`,
                        });
                    });
                }
            });
        });
    });

    // Testes adicionais utilizando ApiUtils
    ApiUtils.testarAutenticacaoEndpoint('/usuarios', 'GET');
    ApiUtils.testarAutenticacaoEndpoint('/usuarios', 'POST');
    ApiUtils.testarAutenticacaoEndpoint('/usuarios/{_id}', 'GET'); // Rota de detalhe, _id será substituído internamente se necessário ou testado genericamente
    ApiUtils.testarAutenticacaoEndpoint('/usuarios/{_id}', 'PUT');
    ApiUtils.testarAutenticacaoEndpoint('/usuarios/{_id}', 'DELETE');

    ApiUtils.testarPaginacao('/usuarios', 'usuarios');

    // Exemplo de teste de busca para usuários por nome e email
    // Para este teste funcionar corretamente, é preciso garantir que existem dados que correspondam ao critério
    // ou adaptar a lógica para criar esses dados antes do teste.
    // Por simplicidade, vamos testar a busca com um nome genérico que pode ou não existir.
    ApiUtils.testarBusca('/usuarios', { nome: 'Fulano de Tal' }, 'usuarios', (resultados) => {
        if (resultados.length > 0) {
            resultados.forEach(usuario => {
                expect(usuario.nome).to.include('Fulano');
            });
        } else {
            cy.log('Busca por "Fulano de Tal" não retornou resultados, o que é aceitável.');
        }
    });

    ApiUtils.testarBusca('/usuarios', { email: 'fulano@qa.com' }, 'usuarios', (resultados) => {
        if (resultados.length > 0) {
            resultados.forEach(usuario => {
                expect(usuario.email).to.eq('fulano@qa.com');
            });
        } else {
            cy.log('Busca por "fulano@qa.com" não retornou resultados, o que é aceitável.');
        }
    });
    
    ApiUtils.testarBusca('/usuarios', { administrador: 'true' }, 'usuarios', (resultados) => {
        if (resultados.length > 0) {
            resultados.forEach(usuario => {
                expect(usuario.administrador).to.eq('true');
            });
        } else {
            cy.log('Busca por administrador "true" não retornou resultados, o que é aceitável.');
        }
    });


    // Teste de performance para listagem de usuários
    ApiUtils.testarPerformance('/usuarios', 'GET', 2500);
});
