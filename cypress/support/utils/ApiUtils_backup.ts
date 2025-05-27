// Backup do ApiUtils original para recuperação
export class ApiUtils {
  static baseUrl = Cypress.env('apiUrl') || 'https://serverest.dev';
  
  static obterUrl(endpoint: string): string {
    const endpointNormalizado = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.baseUrl}${endpointNormalizado}`;
  }
}
