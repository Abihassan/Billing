import { api } from './api';
import { PendingPayment } from '@/types';

export const pendingService = {
 
  getAll: async (): Promise<PendingPayment[]> => {
    const response = await api.get('/pending/');
    return response.data;
  },

  acceptPayment: async (
    customerId: string,
    amount: number
  ): Promise<PendingPayment> => {
    const response = await api.post('/pending/payment/', {
      customer_id: customerId,
      paid: amount,
    });
    return response.data;
  },

  getCustomerHistory: async (customerId: string): Promise<PendingPayment[]> => {
    const response = await api.get(`/customers/${customerId}/pending/`);
    return response.data;
  },
};
