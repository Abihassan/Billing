import axios from 'axios';
import type { StockItem, StockItemCreate, StockItemUpdate, StockTransaction } from '@/types';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getStockItems = async (): Promise<StockItem[]> => {
  const response = await api.get('/stock/');
  return response.data;
};

export const getStockItem = async (id: string): Promise<StockItem> => {
  const response = await api.get(`/stock/${id}`);
  return response.data;
};

export const createStockItem = async (stockData: StockItemCreate): Promise<StockItem> => {
  const response = await api.post('/stock/', stockData);
  return response.data;
};

export const updateStockItem = async (id: string, stockData: StockItemUpdate): Promise<StockItem> => {
  const response = await api.put(`/stock/${id}`, stockData);
  return response.data;
};

export const deleteStockItem = async (id: string): Promise<void> => {
  await api.delete(`/stock/${id}`);
};

export const getStockTransactions = async (id: string, skip = 0, limit = 100): Promise<StockTransaction[]> => {
  const response = await api.get(`/stock/${id}/transactions?skip=${skip}&limit=${limit}`);
  return response.data;
};

export const adjustStockQuantity = async (id: string, adjustment: number, reason = 'manual'): Promise<StockItem> => {
  const response = await api.post(`/stock/${id}/adjust`, { delta: adjustment, reason });
  return response.data;
};

export const exportStockCsv = async (): Promise<Blob> => {
  const response = await api.get('/stock/export', {
    responseType: 'blob',
  });
  return response.data;
};