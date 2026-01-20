import { api } from './api';
import { Customer } from '@/types';

export const customerService = {

  getAll: async (): Promise<Customer[]> => {
    const response = await api.get('/customers/');
    return response.data;
  },

  getById: async (id: string): Promise<Customer> => {
    const response = await api.get(`/customers/${id}/`);
    return response.data;
  },

  create: async (customer: Omit<Customer, 'id' | 'pending'>): Promise<Customer> => {
    const response = await api.post('/customers/', customer);
    return response.data;
  },

  update: async (id: string, customer: Partial<Customer>): Promise<Customer> => {
    const response = await api.put(`/customers/${id}/`, customer);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/customers/${id}/`);
  },
};
