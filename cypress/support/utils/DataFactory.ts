import { fakerPT_BR as faker } from '@faker-js/faker'; // Usando faker em Português do Brasil

// Tipos de Dados para ServeRest (simplificado para o exemplo)
export interface UsuarioServeRest {
  nome: string;
  email: string;
  password?: string; // Opcional, pois o login usa credenciais do env
  administrador: string; // 'true' ou 'false'
  _id?: string; // Retornado pela API
}

export interface ProdutoServeRest {
  nome: string;
  preco: number;
  descricao: string;
  quantidade: number;
  _id?: string; // Retornado pela API
  // imagem?: string; // ServeRest permite imagem, mas vamos simplificar por agora
}

export interface CarrinhoServeRest {
  produtos: Array<{
    idProduto: string;
    quantidade: number;
  }>;
  precoTotal?: number;
  quantidadeTotal?: number;
  _id?: string;
  idUsuario?: string;
}

/**
 * Fábrica de Dados para gerar dados de teste para a API ServeRest.
 * Usa Faker.js para criar dados realistas em Português.
 */
export class DataFactory {

  /**
   * Gera dados de usuário para a API ServeRest.
   * @param isAdmin - Define se o usuário é administrador.
   * @param overrides - Campos opcionais para sobrescrever.
   */
  static gerarUsuarioServeRest(isAdmin: boolean = false, overrides: Partial<UsuarioServeRest> = {}): UsuarioServeRest {
    const nomeCompleto = faker.person.fullName();
    return {
      nome: nomeCompleto,
      email: faker.internet.email({ firstName: nomeCompleto.split(' ')[0], lastName: nomeCompleto.split(' ')[1] , provider: 'qa.com.br'}).toLowerCase(), // Email mais realista e único
      password: faker.internet.password({ length: 10, memorable: false, prefix: 'Pwd@' }),
      administrador: isAdmin ? 'true' : 'false',
      ...overrides
    };
  }
  /**
   * Gera dados de produto para a API ServeRest.
   * @param overrides - Campos opcionais para sobrescrever.
   */  static gerarProdutoServeRest(overrides: Partial<ProdutoServeRest> = {}): ProdutoServeRest {
    const timestamp = Date.now();
    const randomId = faker.string.alphanumeric(8);
    return {
      nome: `${faker.commerce.productName()} ${timestamp}_${randomId}`, // Garantir alta unicidade
      preco: faker.number.int({ min: 10, max: 5000 }), // Corrigido: inteiro sem decimais
      descricao: faker.commerce.productDescription(),
      quantidade: faker.number.int({ min: 1, max: 100 }),
      ...overrides
    };
  }

  /**
   * Gera dados para um carrinho da API ServeRest.
   * @param produtos - Array de produtos a serem adicionados ao carrinho.
   *                 Cada item deve ter idProduto e quantidade.
   * @param overrides - Campos opcionais para sobrescrever.
   */
  static gerarCarrinhoServeRest(produtos: Array<{ idProduto: string; quantidade: number }>, overrides: Partial<CarrinhoServeRest> = {}): CarrinhoServeRest {
    if (!produtos || produtos.length === 0) {
      throw new Error("Pelo menos um produto deve ser fornecido para criar um carrinho.");
    }
    return {
      produtos: produtos,
      ...overrides
    };
  }

  // Manter outros geradores se forem úteis para outros contextos ou adaptá-los.
  // Por exemplo, se a ServeRest tivesse um endpoint de "empresas" ou "pedidos" mais complexos.

  /**
   * Gera dados de usuário genérico (exemplo mantido, pode ser removido se não usado)
   * @param overrides - Optional field overrides
   */
  static generateUser(overrides: Partial<any> = {}): any { // Usando 'any' para simplificar, defina um tipo se usar
    return {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      // ... outros campos genéricos ...
      ...overrides
    };
  }

  /**
   * Generate product data (exemplo mantido, pode ser removido se não usado)
   * @param overrides - Optional field overrides
   */
  static generateProduct(overrides: Partial<any> = {}): any { // Usando 'any' para simplificar
    return {
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price()),
      // ... outros campos genéricos ...
      ...overrides
    };
  }
}

// Definições de tipo genéricas (podem ser movidas para um arquivo de tipos dedicado)
// Estes são exemplos e podem não ser diretamente usados pela ServeRest
export interface UserData {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  birthDate: string;
  website: string;
  avatar: string;
  jobTitle: string;
  company: string;
  bio: string;
  isActive: boolean;
}

export interface ProductData {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  sku: string;
  brand: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  color: string;
  inStock: boolean;
  stockQuantity: number;
  tags: string[];
  rating: number;
  images: string[];
  createdAt: string;
  isActive: boolean;
}

export interface CompanyData { // Exemplo, não usado pela ServeRest diretamente
  id: string;
  name: string;
  description: string;
  industry: string;
  email: string;
  phone: string;
  website: string;
  logo: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  foundedYear: number;
  employeeCount: number;
  revenue: number;
  taxId: string;
  isPublic: boolean;
}

export interface OrderData { // Exemplo, não usado pela ServeRest diretamente
  id: string;
  userId: string;
  products: Array<{ productId: string; quantity: number; price: number }>;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}
