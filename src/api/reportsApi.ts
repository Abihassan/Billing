import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ------------------------------
   Shared Filter Interface
-------------------------------- */
export interface Filters {
  start_date?: string;
  end_date?: string;
  type?: string; 
}

/* ------------------------------
   Strong Response Interfaces
-------------------------------- */
export interface DailySummary {
  date: string;
  invoices: number;
  totalSales: number;
  totalCollected: number;
}

export interface ProductReport {
  productId?: string;
  productName: string;
  totalSold?: number;
  totalRevenue: number;
}

export interface CustomerReport {
  customerId?: string;
  customerName: string;
  totalPurchases?: number;
  totalSpent: number;
}

/* ------------------------------
   Report Endpoints (Fully Typed)
-------------------------------- */

export const getSalesReport = async (filters?: Filters): Promise<unknown> => {
  const response = await api.get('/reports/sales', { params: filters });
  return response.data;
};

export const getDailySummary = async (filters?: Filters): Promise<DailySummary[]> => {
  const response = await api.get('/reports/daily-summary', { params: filters });
  return response.data;
};

export const getProductReport = async (filters?: Filters): Promise<ProductReport[]> => {
  const response = await api.get('/reports/product-performance', { params: filters });
  return response.data;
};

export const getRevenueReport = async (filters?: Filters): Promise<unknown> => {
  const response = await api.get('/reports/revenue', { params: filters });
  return response.data;
};

export const getCustomerReport = async (filters?: Filters): Promise<CustomerReport[]> => {
  const response = await api.get('/reports/customer-performance', { params: filters });
  return response.data;
};
