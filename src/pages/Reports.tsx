import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, TrendingUp, Calendar } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';

import * as reportsApi from '@/api/reportsApi';
import { toast } from 'sonner';

type Daily = {
  date: string;
  invoices: number;
  total_sales: number;
  total_collected: number;
};

type ProductPerf = {
  product_name: string;
  total_quantity: number;
  total_revenue: number;
};

export default function Reports() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportType, setReportType] = useState('all');

  const [daily, setDaily] = useState<Daily[]>([]);
  const [salesSummary, setSalesSummary] = useState<{
    total_revenue: number;
    total_collected: number;
    total_pending: number;
  } | null>(null);
  const [productPerf, setProductPerf] = useState<ProductPerf[]>([]);

  /* ---------------------------------------------------
     ✔ UPDATED loadReports() — Now accepts filters
  --------------------------------------------------- */
  const loadReports = async (filters?: any) => {
    try {
      const [dailyRes, salesRes, prodRes] = await Promise.all([
        reportsApi.getDailySummary(filters),
        reportsApi.getSalesReport(filters),
        reportsApi.getProductReport(filters),
      ]);

      setDaily(dailyRes);
      setSalesSummary(salesRes);
      setProductPerf(prodRes);
    } catch {
      toast.error('Failed to load reports');
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  /* ---------------------------------------------------
     ✔ NEW: handleFilter() 
  --------------------------------------------------- */
  const handleFilter = () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end date');
      return;
    }

    loadReports({
      start_date: startDate,
      end_date: endDate,
      type: reportType,
    });
  };

  const totalRevenue = salesSummary?.total_revenue || 0;
  const totalCollected = salesSummary?.total_collected || 0;
  const totalPending = salesSummary?.total_pending || 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reports</h1>

      {/* DATE FILTER CARD */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Filter by Date Range
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Start Date */}
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            {/* Report Type */}
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sales</SelectItem>
                  <SelectItem value="retail">Retail Only</SelectItem>
                  <SelectItem value="wholesale">Wholesale Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ---------------------------------------------------
              ✔ NEW: Apply Filter button
          --------------------------------------------------- */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleFilter}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Apply Filter
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Total Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Sum of invoice totals</p>
          </CardContent>
        </Card>

        {/* Collected */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collected</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ₹{totalCollected.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Cash received</p>
          </CardContent>
        </Card>

        {/* Pending */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              ₹{totalPending.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Outstanding amount</p>
          </CardContent>
        </Card>

        {/* Total Invoices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invoices</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {daily.reduce((s, d) => s + (d.invoices || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total invoices (sum of daily)</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList>
          <TabsTrigger value="daily">Daily Summary</TabsTrigger>
          <TabsTrigger value="sales">Sales Report</TabsTrigger>
          <TabsTrigger value="products">Product Report</TabsTrigger>
        </TabsList>

        {/* DAILY - TABLE FORMAT */}
        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Summary</CardTitle>
            </CardHeader>

            <CardContent>
              <table className="w-full border rounded-lg overflow-hidden">
                <thead className="bg-muted text-sm">
                  <tr>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Invoices</th>
                    <th className="p-3 text-right">Total Sales</th>
                    <th className="p-3 text-right">Collected</th>
                  </tr>
                </thead>

                <tbody>
                  {daily.map((day) => (
                    <tr key={String(day.date)} className="border-t hover:bg-muted/30">
                      <td className="p-3">
                        {new Date(day.date).toLocaleDateString('en-IN')}
                      </td>

                      <td className="p-3">{day.invoices}</td>

                      <td className="p-3 text-right font-semibold">
                        ₹{(day.total_sales || 0).toLocaleString()}
                      </td>

                      <td className="p-3 text-right text-green-600 font-medium">
                        ₹{(day.total_collected || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SALES - TABLE FORMAT */}
        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Snapshot</CardTitle>
            </CardHeader>

            <CardContent>
              {salesSummary ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Total Revenue</div>
                    <div className="text-xl font-bold">
                      ₹{salesSummary.total_revenue.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Total Collected</div>
                    <div className="text-xl font-bold text-green-600">
                      ₹{salesSummary.total_collected.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Total Pending</div>
                    <div className="text-xl font-bold text-red-600">
                      ₹{salesSummary.total_pending.toLocaleString()}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground">No data</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PRODUCTS */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full border rounded-lg overflow-hidden">
                <thead className="bg-muted text-sm">
                  <tr>
                    <th className="p-3 text-left">Product</th>
                    <th className="p-3 text-right">Quantity Sold</th>
                    <th className="p-3 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {productPerf.map((row) => (
                    <tr key={row.product_name} className="border-t hover:bg-muted/30">
                      <td className="p-3">{row.product_name}</td>
                      <td className="p-3 text-right">
                        {(row.total_quantity || 0).toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-semibold">
                        ₹{(row.total_revenue || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
