import { api } from './api';
import { Product } from '@/types';
import { toCamel, toSnake } from '@/utils/casing';

export const productService = {
  // ---------------------
  // GET ALL PRODUCTS
  // ---------------------
  getAll: async (): Promise<Product[]> => {
    const response = await api.get('/products/');
    return response.data.map((p: any) => toCamel(p)) as Product[];
  },

  // ---------------------
  // GET SINGLE PRODUCT
  // ---------------------
  getById: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}/`);
    return toCamel(response.data) as Product;
  },

  // ---------------------
  // CREATE PRODUCT
  // ---------------------
  create: async (product: Omit<Product, 'id'>): Promise<Product> => {
    const payload = toSnake(product);
    const response = await api.post('/products/', payload);
    return toCamel(response.data) as Product;
  },

  // ---------------------
  // UPDATE PRODUCT
  // ---------------------
  update: async (id: string, product: Partial<Product>): Promise<Product> => {
    const payload = toSnake(product);
    const response = await api.put(`/products/${id}/`, payload);
    return toCamel(response.data) as Product;
  },

  // ---------------------
  // DELETE PRODUCT
  // ---------------------
  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}/`);
  },

  // ---------------------
  // REDUCE STOCK
  // ---------------------
  updateStock: async (id: string, quantity: number): Promise<Product> => {
    const response = await api.patch(`/products/${id}/reduce-stock/`, { quantity });
    return toCamel(response.data) as Product;
  },
};
