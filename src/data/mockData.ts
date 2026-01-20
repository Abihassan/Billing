import { Product, Customer, Sale, PendingPayment, DailySummary } from '@/types';

export const mockProducts: Product[] = [
  { id: '1', name: 'Frame 12x18', category: 'Frames', buyPrice: 80, sellPrice: 150, stock: 20 },
  { id: '2', name: 'Frame 8x10', category: 'Frames', buyPrice: 50, sellPrice: 100, stock: 15 },
  { id: '3', name: 'Photo Album Deluxe', category: 'Albums', buyPrice: 300, sellPrice: 600, stock: 8 },
  { id: '4', name: 'Coffee Mug', category: 'Mugs', buyPrice: 60, sellPrice: 120, stock: 25 },
  { id: '5', name: 'Passport Photo (4 prints)', category: 'Printing', buyPrice: 20, sellPrice: 50, stock: 100 },
  { id: '6', name: 'Canvas Print A3', category: 'Printing', buyPrice: 200, sellPrice: 400, stock: 5 },
  { id: '7', name: 'Ceramic Tile Print', category: 'Gifts', buyPrice: 150, sellPrice: 300, stock: 12 },
  { id: '8', name: 'Keychain', category: 'Gifts', buyPrice: 30, sellPrice: 80, stock: 50 },
];

export const mockCustomers: Customer[] = [
  { id: '1', name: 'Rajesh Kumar', phone: '9876543210', type: 'retail', pending: 0 },
  { id: '2', name: 'Priya Sharma', phone: '9876543211', type: 'wholesale', pending: 1500 },
  { id: '3', name: 'Amit Patel', phone: '9876543212', type: 'wholesale', pending: 2300 },
  { id: '4', name: 'Sneha Desai', phone: '9876543213', type: 'retail', pending: 0 },
  { id: '5', name: 'Vijay Enterprises', phone: '9876543214', type: 'wholesale', pending: 5000 },
];

export const mockSales: Sale[] = [
  {
    id: '1',
    invoiceNumber: 'INV-001',
    date: '2025-11-18',
    customerId: '1',
    customerName: 'Rajesh Kumar',
    customerType: 'retail',
    items: [
      { productId: '1', productName: 'Frame 12x18', quantity: 2, price: 150 },
      { productId: '4', productName: 'Coffee Mug', quantity: 1, price: 120 },
    ],
    subtotal: 420,
    total: 420,
    paid: 420,
    pending: 0,
    paymentMethod: 'Cash',
  },
  {
    id: '2',
    invoiceNumber: 'INV-002',
    date: '2025-11-18',
    customerId: '2',
    customerName: 'Priya Sharma',
    customerType: 'wholesale',
    items: [
      { productId: '3', productName: 'Photo Album Deluxe', quantity: 5, price: 600 },
    ],
    subtotal: 3000,
    total: 4500,
    paid: 3000,
    pending: 1500,
    paymentMethod: 'UPI',
  },
];

export const mockPendingPayments: PendingPayment[] = [
  {
    id: '1',
    customerId: '2',
    customerName: 'Priya Sharma',
    date: '2025-11-17',
    oldPending: 2000,
    paid: 500,
    newPending: 1500,
  },
];

export const mockDailySummary: DailySummary[] = [
  { date: '2025-11-18', totalSales: 4420, totalCollected: 3420, totalPending: 1500, invoices: 2 },
  { date: '2025-11-17', totalSales: 3200, totalCollected: 2700, totalPending: 500, invoices: 3 },
  { date: '2025-11-16', totalSales: 5600, totalCollected: 5600, totalPending: 0, invoices: 5 },
];
