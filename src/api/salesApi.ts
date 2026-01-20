import axios from 'axios';
import type { Sale } from '@/types';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

type BackendSaleItem = {
  id?: string;
  sale_id?: string;
  product_id?: string | null;
  product_name: string;
  quantity: number;
  price: number;
  line_total: number;
  price_type?: 'retail' | 'wholesale';
};

type BackendSale = {
  id: string;
  invoice_number: string;
  date: string;
  customer_id?: string | null;
  customer_name: string;
  customer_phone?: string | null; 
  customer_type: 'retail' | 'wholesale';
  subtotal: number;
  gst: number;
  total: number;
  paid: number;
  pending: number;
  payment_method: 'cash' | 'card' | 'upi' | 'credit';
  created_at?: string;
  items: BackendSaleItem[];
};

const mapSale = (s: BackendSale): Sale => ({
  id: s.id,
  invoiceNumber: s.invoice_number,
  date: s.date,
  customerId: s.customer_id || null,
  customerName: s.customer_name,
  customerPhone: s.customer_phone || null,
  customerType: s.customer_type,
  subtotal: s.subtotal,
  gst: s.gst,
  total: s.total,
  paid: s.paid,
  pending: s.pending,
  paymentMethod: s.payment_method,
  createdAt: s.created_at,
  items: (s.items || []).map((i) => ({
    id: i.id,
    saleId: i.sale_id,
    productId: i.product_id ?? null,
    productName: i.product_name,
    quantity: i.quantity,
    price: i.price,
    lineTotal: i.line_total,
  })),
});

export const saveSale = async (payload: {
  customer_id: string | null;
  customer_name: string;
  customer_type: 'retail' | 'wholesale';
  items: BackendSaleItem[];
  gst_enabled: boolean;
  paid: number;
  payment_method: 'cash' | 'card' | 'upi' | 'credit';
}): Promise<Sale> => {
  const res = await api.post('/sales/', payload);
  return mapSale(res.data as BackendSale);
};

export const getPendingSales = async (): Promise<Sale[]> => {
  const res = await api.get('/sales?pending=true');
  return (res.data as BackendSale[]).map(mapSale);
};

export const payPending = async (saleId: string, amount: number): Promise<Sale> => {
  const res = await api.patch(`/sales/${saleId}/pay`, { amount });
  return mapSale(res.data as BackendSale);
};

export const exportSalesCsv = async (): Promise<Blob> => {
  const res = await api.get('/sales/export', { responseType: 'blob' });
  return res.data;
};
