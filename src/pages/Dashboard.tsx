import { 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 

} from 'lucide-react';

import StatCard from '@/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

import { mockProducts, mockSales, mockCustomers } from '@/data/mockData';
import { Link } from 'react-router-dom';

export default function Dashboard() {

  // ---- BASIC SUMMARY (from Code 2) ----
  const todaySales = mockSales.reduce((sum, sale) => sum + sale.total, 0);
  const todayCollected = mockSales.reduce((sum, sale) => sum + sale.paid, 0);
  const todayPending = mockSales.reduce((sum, sale) => sum + sale.pending, 0);

  // ---- NEW FEATURES FROM CODE 1 ----
  const lowStockProducts = mockProducts.filter(p => p.stock < 5);  // threshold <5
  const totalPendingAmount = mockCustomers.reduce((sum, c) => sum + (c.pending || 0), 0);

  const retailCustomers = mockCustomers.filter(c => c.type === "retail").length;
  const wholesaleCustomers = mockCustomers.filter(c => c.type === "wholesale").length;

  const inventoryValue = mockProducts.reduce(
    (sum, p) => sum + (p.sellPrice * p.stock),
    0
  );

  const lowStockPercent = (lowStockProducts.length / mockProducts.length) * 100;

  const pendingPercent = totalPendingAmount / 200000 * 100; // Example credit limit

  const wholesalePending = mockCustomers.filter(
    c => c.type === 'wholesale' && c.pending > 0
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Link to="/sales">
            <Button>Create Sale</Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards (Upgraded with arrows/trends) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Sales"
          value={`₹${todaySales.toLocaleString()}`}
          icon={DollarSign}
          trend="+12% from yesterday"
          colorClass="text-success"
        />
        <StatCard
          title="Collected"
          value={`₹${todayCollected.toLocaleString()}`}
          icon={TrendingUp}
          trend="Cash received today"
          colorClass="text-primary"
        />
        <StatCard
          title="Pending Added"
          value={`₹${todayPending.toLocaleString()}`}
          icon={Clock}
          trend="New pending today"
          colorClass="text-warning"
        />
        <StatCard
          title="Invoices"
          value={mockSales.length}
          icon={ShoppingBag}
          trend="+5 invoices today"
          colorClass="text-secondary"
        />
      </div>

      {/* ---- NEW: Total Pending Amount + Inventory Status ---- */}
      <div className="grid gap-4 md:grid-cols-2">

        {/* Total Pending Amount */}
        <Card>
          <CardHeader>
            <CardTitle>Total Pending Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-orange-600">
                  ₹{totalPendingAmount.toLocaleString()}
                </span>

                <Badge className="bg-gray-300 text-black">
                  {mockCustomers.filter(c => c.pending > 0).length} customers
                </Badge>
              </div>

              <Progress value={pendingPercent} className="h-2 bg-gray-200 [&>div]:bg-blue-600" />

              <p className="text-sm text-gray-600">
                {pendingPercent.toFixed(1)}% of estimated credit limit
              </p>
            </div>
          </CardContent>
        </Card>


        {/* Inventory Status */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">

              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-black">{mockProducts.length}</span>
                <Badge className="bg-gray-300 text-black">Total Products</Badge>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Low Stock Items</span>
                <span className="font-bold text-orange-600">
                  {lowStockProducts.length}
                </span>
              </div>

              <Progress value={lowStockPercent} className="h-2 bg-gray-200 [&>div]:bg-blue-600" />

            </div>
          </CardContent>
        </Card>

      </div>

      {/* ---- Detailed Low Stock Alerts (Category + Badge) ---- */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            Low Stock Alerts ({lowStockProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lowStockProducts.length === 0 ? (
            <p className="text-muted-foreground">All products are well stocked</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {lowStockProducts.map(product => (
                <div
                  key={product.id}
                  className="flex justify-between items-center p-3 bg-white rounded-lg border border-red-200"
                >
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {product.category}
                    </div>
                  </div>

                  <Badge variant="destructive">Stock: {product.stock}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ---- Quick Stats ---- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {mockCustomers.length}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Total Customers</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {retailCustomers}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Retail Customers</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">
              {wholesaleCustomers}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Wholesale Customers</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">
              ₹{inventoryValue.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Inventory Value</div>
          </CardContent>
        </Card>

      </div>

      {/* ---- Pending Customers (existing in Code 2) ---- */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-warning" />
              Pending Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {wholesalePending.length === 0 ? (
              <p className="text-muted-foreground">No pending payments</p>
            ) : (
              <div className="space-y-2">
                {wholesalePending.slice(0, 3).map(customer => (
                  <div
                    key={customer.id}
                    className="flex justify-between items-center p-2 bg-warning/10 rounded"
                  >
                    <span className="font-medium">{customer.name}</span>
                    <span className="text-sm text-warning font-semibold">
                      ₹{customer.pending.toLocaleString()}
                    </span>
                  </div>
                ))}

                {wholesalePending.length > 3 && (
                  <Link to="/pending">
                    <Button variant="link" className="w-full">View all pending</Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
