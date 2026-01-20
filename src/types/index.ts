export interface Product {
  id: string;
  name: string;
  category: string;
  retailPrice: number;
  wholesalePrice: number;
  isWholesaleOnly: boolean;
  stock: number;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  type: 'retail' | 'wholesale';
  pending: number;
  createdAt?: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  date: string;
  customerId: string;
  customerName: string;
  customerPhone: string | null;     
  customerType: 'retail' | 'wholesale';
  items: SaleItem[];
  subtotal: number;
  gst: number;
  total: number;
  paid: number;
  pending: number;
  paymentMethod: string;
  createdAt?: string;
}

export interface PendingPayment {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  oldPending: number;
  paid: number;
  newPending: number;
}

export interface DailySummary {
  date: string;
  totalSales: number;
  totalCollected: number;
  totalPending: number;
  invoices: number;
}


export interface StockItem {
  id: string;
  name: string;
  category: string;
  buyPrice?: number;  
  sellPrice?: number; 
  quantity: number;  
}

export interface StockItemCreate {
  name: string;
  category: string;
  buyPrice?: number;
  sellPrice?: number;
  quantity: number;
}

export interface StockItemUpdate {
  name?: string;
  category?: string;
  buyPrice?: number;
  sellPrice?: number;
  quantity?: number;
}

export interface StockTransaction {
  id: string;
  stockItemId: string;
  date: string;
  delta: number;         
  reason: string;
  oldQuantity: number;
  newQuantity: number;
}
