import { api } from './api';
import { Sale } from '@/types';

export const salesService = {

  getAll: async (): Promise<Sale[]> => {
    const response = await api.get('/sales/');
    return response.data;
  },

  getById: async (id: string): Promise<Sale> => {
    const response = await api.get(`/sales/${id}/`);
    return response.data;
  },

  create: async (sale: Omit<Sale, 'id' | 'invoiceNumber' | 'date'>): Promise<Sale> => {
    const response = await api.post('/sales/', sale);
    return response.data;
  },

  getByDateRange: async (startDate: string, endDate: string): Promise<Sale[]> => {
    const response = await api.get('/sales/', {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  getCustomerHistory: async (customerId: string): Promise<Sale[]> => {
    const response = await api.get(`/customers/${customerId}/sales/`);
    return response.data;
  },
};
