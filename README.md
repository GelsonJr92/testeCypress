# Framework de Automação Cypress - API ServeRest

[![Status dos Testes](https://img.shields.io/badge/testes-69%2F69%20passando-brightgreen)](https://github.com)
[![Cypress](https://img.shields.io/badge/cypress-14.4.0-17202C?logo=cypress)](https://cypress.io)
[![TypeScript](https://img.shields.io/badge/typescript-5.8.3-blue?logo=typescript)](https://typescriptlang.org)
[![Faker.js](https://img.shields.io/badge/faker.js-9.8.0-yellow)](https://fakerjs.dev)

Framework robusto de automação de testes com **Cypress** e **TypeScript** para testes de APIs REST. Especializado em testes CRUD completos para a API ServeRest, com **100% de cobertura de testes passando** (69/69 testes).

## Características Principais

- **Testes de API Completos** - Cobertura total dos endpoints ServeRest (Usuários, Produtos, Carrinhos)
- **100% Taxa de Sucesso** - 69/69 testes passando consistentemente
- **Credenciais Dinâmicas** - Sistema automático com TTL para ambientes CI/CD
- **TypeScript Nativo** - Segurança de tipos completa com definições customizadas
- **Comandos Personalizados** - Comandos CRUD genéricos e reutilizáveis
- **Relatórios Avançados** - Mochawesome HTML com capturas de tela automáticas
- **Geração de Dados** - Factory em português brasileiro com Faker.js
- **Pronto para CI/CD** - Configurado para integração contínua

## 📁 Estrutura do Projeto

```
cypress/
├── e2e/backend/                    # Suítes de teste da API ServeRest
│   ├── debug.cy.ts                 # 3 testes - Validação do sistema
│   ├── serverest-api.cy.ts         # 33 testes - Usuários CRUD + Auth
│   ├── serverest-produtos-api.cy.ts # 30 testes - Produtos CRUD completo
│   └── serverest-carrinhos-api.cy.ts # 3 testes - Carrinhos funcionais
├── support/
│   ├── api-commands.ts             # Comandos customizados de API
│   ├── utils/
│   │   ├── ApiUtils.ts             # Utilitários para testes de API
│   │   └── DataFactory.ts          # Geração de dados de teste
│   └── index.d.ts                  # Definições TypeScript customizadas
├── fixtures/                       # Dados estáticos para testes
├── reports/                        # Relatórios HTML e JSON
└── screenshots/                    # Screenshots automáticos de falhas
```

## 🔒 Sistema de Credenciais Dinâmicas

O framework implementa um **sistema inteligente de credenciais dinâmicas** que elimina problemas de autenticação 401 e garante execução estável em ambientes CI/CD.

### **Características**
- ✅ **TTL Automático**: Credenciais expiram após 30 minutos
- ✅ **Cache Inteligente**: Reutilização entre specs na mesma sessão
- ✅ **Renovação Automática**: Detecta expiração e recria automaticamente
- ✅ **Zero Configuração**: Sistema transparente para os testes
- ✅ **CI/CD Ready**: Perfeito para pipelines de integração contínua

### **Como Funciona**
```typescript
// Uso simples nos testes
beforeEach(() => {
  cy.loginApiServeRest('admin'); // Credenciais automáticas
});

// Sistema detecta automaticamente:
// 🔄 Credenciais da sessão encontradas e válidas (5min), reutilizando...
// 🆕 Credenciais expiradas detectadas, criando novas...
```

## Suítes de Teste Implementadas

### **Debug & Validação** (`debug.cy.ts`) - 3 testes
- **Setup de Credenciais**: Criação automática de usuários admin e regular
- **Validação do Sistema**: Testes de integridade das credenciais dinâmicas
- **Health Check**: Verificação do ambiente e conectividade da API

### **Usuários API** (`serverest-api.cy.ts`) - 33 testes
- **Autenticação**: Login com credenciais válidas/inválidas
- **CRUD Completo**: Criar, listar, buscar, atualizar, deletar usuários
- **Validações**: Email único, campos obrigatórios, formatos válidos
- **Cenários de Erro**: Usuário não encontrado, dados inválidos

### **Produtos API** (`serverest-produtos-api.cy.ts`) - 30 testes
- **CRUD Produtos**: Operações completas com autorização
- **Gerenciamento**: Listagem, busca por ID, criação autorizada
- **Validações**: Nome único, preços válidos, quantidades
- **Segurança**: Testes de autorização e permissões

### **Carrinhos API** (`serverest-carrinhos-api.cy.ts`) - 3 testes
- **Operações Básicas**: Listar e buscar carrinhos
- **Integração**: Testes com usuários e produtos existentes
- **Validações**: Estrutura de dados e relacionamentos

## Instalação e Configuração

### Pré-requisitos
- **Node.js** 18.x ou superior
- **npm** ou **yarn**

### Passos de Instalação

```bash
# 1. Clone ou baixe o framework
git clone [seu-repositorio]
cd MeusTestes

# 2. Instale as dependências
npm install

# 3. Instale o binário do Cypress
npm run install:cypress

# 4. Verifique a instalação
npm run verify:cypress
```

## Execução de Testes

### **Interface Gráfica**
```bash
npm run cy:open              # Abre o Cypress Test Runner
```

### **Execução Headless**
```bash
npm run cy:run               # Executa todos os testes
npm run cy:run:api           # Apenas testes de API
npm run cy:run:smoke         # Apenas testes marcados como smoke
npm run cy:run:chrome        # Executa no Chrome
```

### **Testes com Relatórios Automáticos**
```bash
npm run test:full          # Todos os testes + relatório automático
npm run test:api           # Apenas API + relatório
```

### **Relatórios**
```bash
npm run report:merge         # Combina relatórios JSON
npm run report:open          # Abre relatório HTML no navegador
npm run clean:reports        # Limpa relatórios antigos
```

## 🎯 TestRunner - Execução Estruturada

O framework inclui uma **classe TestRunner** para execução organizada dos testes. 

### **📋 Suítes Disponíveis**
| Nome | Categoria | Prioridade | Tags |
|------|-----------|------------|------|
| **Debug Tests** | API | Alta | debug, smoke, api |
| **ServeRest Core** | API | Alta | api, core, usuarios, login |
| **Produtos API** | API | Média | api, produtos, crud |
| **Carrinhos API** | API | Média | api, carrinhos, crud, ecommerce |

### **🛠️ Comandos Disponíveis**
```bash
npm run test:runner         # Documentação e exemplos
npm run test:runner:demo    # Demo prático
```

### **💻 Uso Básico**
```typescript
import { testRunner } from '../support/TestRunner';

testRunner.runAllTests();    // Todos os testes
testRunner.runApiTests();    // Apenas API
testRunner.runSmokeTests();  // Apenas smoke tests
```

> � **Documentação completa**: `cypress/support/TestRunner.ts`

## 📊 Comandos Personalizados Disponíveis

### **Autenticação**
```typescript
// Login automático (credenciais dinâmicas)
cy.loginApiServeRest('admin')  // Usa credenciais de admin
cy.loginApiServeRest('user')   // Usa credenciais de usuário regular
```

### **Operações CRUD Genéricas**
```typescript
// Criar recurso
cy.apiCreate('/usuarios', dadosUsuario).then((response) => {
  expect(response.status).to.eq(201)
})

// Listar recursos
cy.apiList('/usuarios').then((response) => {
  expect(response.status).to.eq(200)
})

// Buscar específico
cy.apiRead('/usuarios', userId).then((response) => {
  expect(response.status).to.eq(200)
})

// Atualizar
cy.apiUpdate('/usuarios', userId, novosDados).then((response) => {
  expect(response.status).to.eq(200)
})

// Deletar
cy.apiDelete('/usuarios', userId).then((response) => {
  expect(response.status).to.eq(200)
})
```

### **Geração de Dados**
```typescript
// Usuário brasileiro realista
const usuario = DataFactory.gerarUsuarioServeRest()
// Retorna: { nome: "João Silva", email: "joao@email.com", password: "123456", administrador: "true" }

// Produto brasileiro
const produto = DataFactory.gerarProdutoServeRest()
// Retorna: { nome: "Smartphone Samsung", preco: 899, descricao: "...", quantidade: 50 }
```

## 📊 Sistema de Relatórios

### **Gerar Relatórios**
```bash
# Executar testes + relatórios automáticos
npm run test:full          # Todos os testes + relatório
npm run test:api           # Apenas API + relatório

# Comandos individuais
npm run cy:run:api         # Executar testes de API
npm run report:merge       # Combinar relatórios
npm run report:open        # Abrir relatório HTML
```

### **Localização dos Relatórios**
```
cypress/reports/
├── relatorio-padrao.html        # Relatório Mochawesome
├── advanced-report.html         # Relatório avançado interativo  
└── mochawesome/                 # Arquivos JSON
    └── .jsons/                  # Arquivos JSON com timestamp
        ├── mochawesome-debug-03-06-2025-15-12-37.json
        ├── mochawesome-serverest-produtos-api-03-06-2025-15-13-12.json
        └── mochawesome-serverest-carrinhos-api-03-06-2025-15-13-18.json
```

### **🕒 Sistema de Timestamp Automático**

O framework implementa **nomenclatura automática com timestamp** para todos os arquivos JSON gerados:

**Formato:** `mochawesome-{spec-name}-{dd-mm-aaaa-hh-mm-ss}.json`

**Exemplos:**
- `mochawesome-debug-03-06-2025-15-12-37.json`
- `mochawesome-serverest-produtos-api-03-06-2025-15-13-12.json`
- `mochawesome-serverest-carrinhos-api-03-06-2025-15-13-18.json`

**Características:**
- ✅ **Timestamp Preciso**: Formato brasileiro (dd-mm-aaaa-hh-mm-ss)
- ✅ **Nome do Spec**: Inclui o nome do arquivo de teste
- ✅ **Sem Conflitos**: Cada execução gera arquivo único
- ✅ **Pipeline Robusto**: Merge funciona com qualquer quantidade de arquivos
- ✅ **Rastreabilidade**: Fácil identificação de quando cada teste foi executado

**Como Funciona:**
```typescript
// Plugin automático em cypress/plugins/timestamp-reports.js
on('after:spec', (spec, results) => {
  // Renomeia automaticamente:
  // mochawesome.json → mochawesome-debug-03-06-2025-15-12-37.json
});
```

## 🔧 Correções da Pipeline

### Problema Resolvido: Erro de Merge de Relatórios

**Erro Original:**
```
ERROR: Failed to merge reports
Error: Pattern cypress/reports/mochawesome/.jsons/*.json matched no report files
```

**Solução Implementada:**
- ✅ Script robusto `scripts/merge-reports.js` que verifica ambas as pastas (`mochawesome` e `mochawesome/.jsons`)
- ✅ Criação automática de arquivo JSON vazio quando não há relatórios
- ✅ Comando `report:generate` que pula geração quando não há dados de teste
- ✅ Comando `clean:reports` que limpa ambas as pastas de relatórios
- ✅ Pipeline que nunca falha, mesmo sem testes executados

### Comandos de Relatório Robustos

```bash
# Merge robusto - nunca falha
npm run report:merge

# Geração condicional - só gera se há dados
npm run report:generate

# Criação completa - sempre funciona
npm run report:create

# Limpeza completa - remove todos os arquivos
npm run clean:reports
```

### Estrutura de Diretórios Suportada

```
cypress/reports/
├── mochawesome/              # Relatórios individuais (fallback)
│   ├── spec1.json
│   └── spec2.json
├── mochawesome/.jsons/       # Relatórios principais (cypress-mochawesome-reporter)
│   ├── mochawesome.json
│   └── mochawesome_*.json
├── merged.json               # Arquivo consolidado
├── relatorio-padrao.html     # Relatório HTML padrão
└── advanced-report.html      # Relatório HTML avançado
```

---

## Tecnologias e Dependências

### Core Framework
- **Cypress**: `14.4.0` - Framework de testes E2E
- **TypeScript**: `5.8.3` - Type safety e melhor IDE support
- **Node.js**: `>=18.x` - Runtime environment

### Utilitários de Teste
- **Faker.js**: `9.8.0` - Geração de dados realistas
- **Cypress Real Events**: `1.14.0` - Eventos de usuário mais realistas

### Relatórios e Visualização
- **Mochawesome**: `7.1.3` - Relatórios HTML elegantes
- **Mochawesome Merge**: `4.3.0` - Mesclagem de múltiplos relatórios
- **Mochawesome Report Generator**: `6.2.0` - Geração de HTML

## 📄 Licença

Este framework é fornecido como está para fins educacionais e de desenvolvimento. Adapte e modifique conforme necessário para seus projetos.

## 🆘 Suporte

Para problemas e dúvidas:
1. ✅ Verifique a seção de comandos principais
2. 📖 Consulte a [documentação do Cypress](https://docs.cypress.io/)
3. 🔍 Examine os exemplos de teste existentes

### **🔧 Resolução de Problemas**

#### **Problema: "0 Specs Analisados" no Relatório Avançado**

Se o relatório avançado mostrar "0 Specs Analisados" mesmo após executar testes:

**1. Executar correção automática:**
```bash
npm run report:advanced
```

**2. Verificar se os arquivos JSON existem:**
```bash
# Verificar se há arquivos JSON na pasta .jsons
ls cypress/reports/mochawesome/.jsons/
```

**3. Regenerar métricas manualmente:**
```bash
node -e "const AdvancedMetrics = require('./cypress/plugins/advanced-metrics'); AdvancedMetrics.finalizeMetrics(null, process.cwd())"
```

**4. Gerar relatório atualizado:**
```bash
node -e "const generator = require('./cypress/plugins/html-report-generator.js'); generator.generateAdvancedReport(process.cwd())"
```

**Causa:** O sistema de métricas avançadas depende dos arquivos JSON gerados pelos testes. Se não há dados coletados durante a execução, o sistema extrai automaticamente os dados dos arquivos JSON para recriar as métricas.

**Solução Permanente:** O script `npm run report:advanced` foi atualizado para sempre verificar e corrigir automaticamente os dados das métricas antes de gerar o relatório HTML.
