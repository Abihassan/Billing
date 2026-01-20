import { useEffect, useMemo, useState } from 'react';
import { Plus, Minus, Trash2, Search, ShoppingCart, Printer, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

import { InvoiceModal } from '@/components/modals/InvoiceModal';

import * as productApi from '@/api/productApi';
import * as customerApi from '@/api/customerApi';
import * as salesApi from '@/api/salesApi';

type UUID = string;
type Product = {
  id: UUID;
  name: string;
  category: string;
  retailPrice: number;
  wholesalePrice: number;
  stock: number;
};
type Customer = {
  id: UUID;
  name: string;
  phone: string;
  email?: string;
  type: 'retail' | 'wholesale';
  address?: string;
  pending: number;
};
type SaleItem = {
  productId: UUID | null;
  productName: string;
  quantity: number;
  price: number;
  lineTotal?: number;
};

export default function Sales() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [p, c] = await Promise.all([productApi.getProducts(), customerApi.getCustomers()]);
      setProducts(p as any);
      setCustomers(c as any);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load data');
    }
  };

  // STATES
  const [customerType, setCustomerType] = useState<'retail' | 'wholesale'>('retail');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [addingCustomer, setAddingCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState<{ name: string; phone: string }>({ name: '', phone: '' });
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [search, setSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [currentSale, setCurrentSale] = useState<any | null>(null);
  const [gstEnabled, setGstEnabled] = useState(false);
  const [paidAmount, setPaidAmount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi' | 'credit'>('cash');

  // NEW: Toggle wholesale/retail price display
  const [showWholesale, setShowWholesale] = useState(false);

  const categories = useMemo(() => ['all', ...Array.from(new Set(products.map((p) => p.category)))], [products]);

  // PRODUCT FILTER
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory && product.stock > 0;
  });

  // CUSTOMER FILTER
  const filteredCustomers = customers.filter(
    (c) =>
      (c.name.toLowerCase().includes(customerSearch.toLowerCase()) || (c.phone || '').includes(customerSearch)) &&
      c.type === customerType
  );

  // CART FUNCTIONS
  const addToCart = (product: Product) => {
    if (!selectedCustomer) {
      return toast.error('Please select a customer first');
    }

    const existing = cart.find((item) => item.productId === product.id);
    const price = showWholesale ? product.wholesalePrice : product.retailPrice;

    if (existing) {
      if (existing.quantity + 1 > product.stock) {
        return toast.error('Insufficient stock');
      }
      setCart(cart.map((i) => (i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i)));
    } else {
      setCart([...cart, { productId: product.id, productName: product.name, quantity: 1, price }]);
    }
  };

  const updateQuantity = (productId: string, qty: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (qty > product.stock) return toast.error('Insufficient stock');
    if (qty <= 0) return setCart(cart.filter((i) => i.productId !== productId));

    setCart(cart.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i)));
  };

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const gstAmount = gstEnabled ? subtotal * 0.18 : 0;
  const previousPending = selectedCustomer?.pending || 0;
  const total = subtotal + gstAmount + previousPending;
  const newPending = Math.max(0, total - paidAmount);
  const balance = Math.max(0, paidAmount - total);

  // CREATE CUSTOMER INLINE
  const handleCreateCustomer = async () => {
    if (!newCustomer.name.trim() || !newCustomer.phone.trim()) {
      return toast.error('Name and phone are required');
    }
    try {
      const created = await customerApi.createCustomer({ name: newCustomer.name.trim(), phone: newCustomer.phone.trim(), type: customerType } as any);
      toast.success('Customer created');
      setAddingCustomer(false);
      setNewCustomer({ name: '', phone: '' });
      await loadData();
      setSelectedCustomer(created as any);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create customer');
    }
  };

  // SAVE INVOICE
  const handleSaveInvoice = async () => {
    if (!selectedCustomer) return toast.error('Please select a customer');
    if (cart.length === 0) return toast.error('Cart empty');

    const items = cart.map((i) => ({ product_id: i.productId, product_name: i.productName, quantity: i.quantity, price: i.price, line_total: i.price * i.quantity }));

    const payload = {
      customer_id: selectedCustomer.id,
      customer_name: selectedCustomer.name,
      customer_type: customerType,
      items,
      gst_enabled: gstEnabled,
      paid: paidAmount,
      payment_method: paymentMethod,
    };

    try {
      const saved = await salesApi.saveSale(payload as any);
      toast.success('Invoice saved');
      await loadData();
      setCurrentSale(saved);
      setIsInvoiceOpen(true);
      setCart([]);
      setPaidAmount(0);
      setSelectedCustomer(null);
      setGstEnabled(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save invoice');
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Point of Sale</h1>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-2" /> Print
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-6">
          {/* CUSTOMER SECTION */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Selection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch checked={showWholesale} onCheckedChange={(v) => { setShowWholesale(v); setCustomerType(v ? "wholesale" : "retail"); }} />
                <Badge>{customerType}</Badge>
              </div>

              <div className="flex items-center justify-between gap-2">
                <Input placeholder="Search customer..." value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} />
                <Button variant="outline" onClick={() => setAddingCustomer((s) => !s)}>
                  {addingCustomer ? 'Cancel' : 'Add New Customer'}
                </Button>
              </div>

              {addingCustomer && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-3 border rounded-lg">
                  <Input placeholder="Name" value={newCustomer.name} onChange={(e) => setNewCustomer((s) => ({ ...s, name: e.target.value }))} />
                  <Input placeholder="Phone" value={newCustomer.phone} onChange={(e) => setNewCustomer((s) => ({ ...s, phone: e.target.value }))} />
                  <Button onClick={handleCreateCustomer} className="w-full">Create & Select</Button>
                </div>
              )}

              {customerSearch && (
                <div className="max-h-40 border overflow-y-auto rounded">
                  {filteredCustomers.map((c) => (
                    <div key={c.id} className="p-3 border-b cursor-pointer hover:bg-accent" onClick={() => { setSelectedCustomer(c); setCustomerSearch(''); }}>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-sm">{c.phone}</div>
                      {c.pending > 0 && <div className="text-red-600">Pending: ₹{c.pending}</div>}
                    </div>
                  ))}
                </div>
              )}

              {selectedCustomer && (
                <div className="p-3 bg-primary/10 rounded border">
                  <div className="font-medium">{selectedCustomer.name}</div>
                  <div className="text-sm">{selectedCustomer.phone}</div>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedCustomer(null)}>Clear</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* PRODUCTS */}
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4" />
                <Input placeholder="Search products..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>

              <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList className="overflow-x-auto flex-nowrap">
                  {categories.map((cat) => (
                    <TabsTrigger key={cat} value={cat} className="capitalize">{cat}</TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              <div className="grid sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="border p-4 rounded-lg">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">{product.category}</div>
                      </div>
                      <Badge>{product.stock}</Badge>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <div className="text-lg font-bold text-green-600">₹{(showWholesale ? product.wholesalePrice : product.retailPrice).toLocaleString()}</div>
                      <Button size="sm" onClick={() => addToCart(product)}>
                        <Plus className="w-4 h-4 mr-1" /> Add
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT SIDE (cart & billing) */}
        <div className="space-y-6">
          {/* CART */}
          <Card>
            <CardHeader>
              <CardTitle><ShoppingCart className="w-5 h-5 inline mr-2" /> Cart ({cart.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">Cart empty</p>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.productId ?? Math.random()} className="p-3 border rounded-lg">
                      <div className="flex justify-between">
                        <div>
                          <div className="font-medium">{item.productName}</div>
                          <div className="text-sm">₹{item.price} × {item.quantity}</div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setCart(cart.filter((i) => i.productId !== item.productId))}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="font-bold text-green-600">₹{(item.price * item.quantity).toLocaleString()}</div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => updateQuantity(item.productId as string, item.quantity - 1)}><Minus className="w-3 h-3" /></Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button size="sm" variant="outline" onClick={() => updateQuantity(item.productId as string, item.quantity + 1)}><Plus className="w-3 h-3" /></Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* BILLING */}
          <Card>
            <CardHeader><CardTitle>Billing Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Switch checked={gstEnabled} onCheckedChange={setGstEnabled} />
                  <Label>GST 18%</Label>
                </div>
                <span>₹{gstAmount.toLocaleString()}</span>
              </div>
              {previousPending > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Previous Pending</span>
                  <span>₹{previousPending.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>

              <div>
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="credit">Credit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Paid Amount</Label>
                <Input type="number" value={paidAmount} onChange={(e) => setPaidAmount(Number(e.target.value))} />
              </div>

              {newPending > 0 && <div className="flex justify-between text-red-600"><span>New Pending</span><span>₹{newPending.toLocaleString()}</span></div>}
              {balance > 0 && <div className="flex justify-between text-green-600"><span>Balance Return</span><span>₹{balance.toLocaleString()}</span></div>}

              <Button className="w-full" size="lg" onClick={handleSaveInvoice} disabled={cart.length === 0 || !selectedCustomer}>
                <Save className="w-4 h-4 mr-2" /> Save Invoice
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <InvoiceModal open={isInvoiceOpen} onClose={() => setIsInvoiceOpen(false)} sale={currentSale} />
    </div>
  );
}
