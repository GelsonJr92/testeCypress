import { faker } from '@faker-js/faker';

/**
 * Data Factory for generating test data
 * Uses Faker.js to create realistic test data
 */
export class DataFactory {
  
  /**
   * Generate user data
   * @param overrides - Optional field overrides
   */
  static generateUser(overrides: Partial<UserData> = {}): UserData {
    return {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zipCode: faker.location.zipCode(),
      country: faker.location.country(),
      birthDate: faker.date.birthdate().toISOString().split('T')[0],
      website: faker.internet.url(),
      avatar: faker.image.avatar(),
      jobTitle: faker.person.jobTitle(),
      company: faker.company.name(),
      bio: faker.lorem.paragraph(),
      isActive: faker.datatype.boolean(),
      ...overrides
    };
  }

  /**
   * Generate product data
   * @param overrides - Optional field overrides
   */
  static generateProduct(overrides: Partial<ProductData> = {}): ProductData {
    return {
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price()),
      category: faker.commerce.department(),
      sku: faker.string.alphanumeric(8).toUpperCase(),
      brand: faker.company.name(),
      weight: parseFloat(faker.string.numeric(2)),
      dimensions: {
        length: parseFloat(faker.string.numeric(2)),
        width: parseFloat(faker.string.numeric(2)),
        height: parseFloat(faker.string.numeric(2))
      },
      color: faker.color.human(),
      inStock: faker.datatype.boolean(),
      stockQuantity: faker.number.int({ min: 0, max: 1000 }),
      tags: faker.helpers.arrayElements(['popular', 'new', 'sale', 'premium', 'limited'], { min: 1, max: 3 }),
      rating: faker.number.float({ min: 1, max: 5, multipleOf: 0.1 }),
      images: [
        faker.image.url(),
        faker.image.url(),
        faker.image.url()
      ],
      createdAt: faker.date.recent().toISOString(),
      isActive: faker.datatype.boolean(),
      ...overrides
    };
  }

  /**
   * Generate company data
   * @param overrides - Optional field overrides
   */
  static generateCompany(overrides: Partial<CompanyData> = {}): CompanyData {
    return {
      id: faker.string.uuid(),
      name: faker.company.name(),
      description: faker.company.catchPhrase(),
      industry: faker.helpers.arrayElement(['Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing']),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      website: faker.internet.url(),
      logo: faker.image.url(),
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
        country: faker.location.country()
      },
      foundedYear: faker.date.past({ years: 50 }).getFullYear(),
      employeeCount: faker.number.int({ min: 1, max: 10000 }),
      revenue: faker.number.int({ min: 100000, max: 10000000 }),
      taxId: faker.string.alphanumeric(10),
      isPublic: faker.datatype.boolean(),
      ...overrides
    };
  }

  /**
   * Generate order data
   * @param overrides - Optional field overrides
   */
  static generateOrder(overrides: Partial<OrderData> = {}): OrderData {
    const items = faker.helpers.multiple(() => ({
      productId: faker.string.uuid(),
      productName: faker.commerce.productName(),
      quantity: faker.number.int({ min: 1, max: 10 }),
      price: parseFloat(faker.commerce.price()),
      total: 0 // Will be calculated
    }), { count: { min: 1, max: 5 } });    // Calculate totals
    const itemsWithTotals = items.map(item => ({
      ...item,
      total: item.quantity * item.price
    }));    const subtotal = itemsWithTotals.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.1; // 10% tax
    const shipping = subtotal > 100 ? 0 : 15; // Free shipping over $100

    return {
      id: faker.string.uuid(),
      orderNumber: faker.string.alphanumeric(8).toUpperCase(),
      customerId: faker.string.uuid(),
      customerName: faker.person.fullName(),
      customerEmail: faker.internet.email(),
      status: faker.helpers.arrayElement(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
      items: itemsWithTotals,
      subtotal,
      tax,
      shipping,
      total: subtotal + tax + shipping,
      currency: 'USD',
      paymentMethod: faker.helpers.arrayElement(['credit_card', 'paypal', 'bank_transfer', 'cash']),
      shippingAddress: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
        country: faker.location.country()
      },
      orderDate: faker.date.recent().toISOString(),
      estimatedDelivery: faker.date.future().toISOString(),
      notes: faker.lorem.sentence(),
      ...overrides
    };
  }

  /**
   * Generate random data based on type
   * @param type - Data type to generate
   * @param count - Number of records to generate
   * @param overrides - Optional field overrides
   */
  static generate(type: 'user' | 'product' | 'company' | 'order', count: number = 1, overrides: any = {}): any[] {
    const generators = {
      user: this.generateUser,
      product: this.generateProduct,
      company: this.generateCompany,
      order: this.generateOrder
    };

    return faker.helpers.multiple(() => generators[type](overrides), { count });
  }

  /**
   * Generate data for specific fields
   */
  static field = {
    email: () => faker.internet.email(),
    name: () => faker.person.fullName(),
    phone: () => faker.phone.number(),
    address: () => faker.location.streetAddress(),
    date: () => faker.date.recent().toISOString().split('T')[0],
    dateTime: () => faker.date.recent().toISOString(),
    url: () => faker.internet.url(),
    uuid: () => faker.string.uuid(),
    number: (min: number = 1, max: number = 100) => faker.number.int({ min, max }),
    decimal: (min: number = 1, max: number = 100) => faker.number.float({ min, max, multipleOf: 0.01 }),
    boolean: () => faker.datatype.boolean(),
    text: (length: number = 50) => faker.lorem.text().substring(0, length),
    paragraph: () => faker.lorem.paragraph(),
    word: () => faker.lorem.word(),
    words: (count: number = 3) => faker.lorem.words(count),
    alphanumeric: (length: number = 8) => faker.string.alphanumeric(length),
    password: () => faker.internet.password({ length: 12 }),
    image: () => faker.image.url(),
    color: () => faker.color.human(),
    currency: () => faker.finance.currencyCode(),
    price: () => parseFloat(faker.commerce.price())
  };
}

// ===============================================
// TYPE DEFINITIONS
// ===============================================

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

export interface CompanyData {
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

export interface OrderData {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  status: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  paymentMethod: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  orderDate: string;
  estimatedDelivery: string;
  notes: string;
}
