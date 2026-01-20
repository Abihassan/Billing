import axios from 'axios';
import type { Customer } from '@/types';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

type BackendCustomer = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  type: 'retail' | 'wholesale';
  address?: string;
  pending: number;
  created_at?: string;
};

const mapCustomer = (c: BackendCustomer): Customer => ({
  id: c.id,
  name: c.name,
  phone: c.phone,
  type: c.type,
  pending: c.pending,
});

export const getCustomers = async (type?: 'retail' | 'wholesale'): Promise<Customer[]> => {
  const params = type ? `?type=${type}` : '';
  const res = await api.get(`/customers/${params}`);
  return (res.data as BackendCustomer[]).map(mapCustomer);
};

export const getCustomer = async (id: string): Promise<Customer> => {
  const res = await api.get(`/customers/${id}`);
  return mapCustomer(res.data as BackendCustomer);
};

export const createCustomer = async (data: Omit<Customer, 'id' | 'pending' | 'createdAt'>): Promise<Customer> => {
  const payload = {
    name: data.name,
    phone: data.phone,
    type: data.type,
  };
  const res = await api.post('/customers/', payload);
  return mapCustomer(res.data as BackendCustomer);
};

export const updateCustomer = async (id: string, data: Partial<Customer>): Promise<Customer> => {
  const payload: any = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.phone !== undefined) payload.phone = data.phone;
  if (data.type !== undefined) payload.type = data.type;

  const res = await api.put(`/customers/${id}`, payload);
  return mapCustomer(res.data as BackendCustomer);
};

export const deleteCustomer = async (id: string): Promise<void> => {
  await api.delete(`/customers/${id}`);
};

export const exportCustomersCsv = async (): Promise<Blob> => {
  const res = await api.get('/customers/export', { responseType: 'blob' });
  return res.data;
};