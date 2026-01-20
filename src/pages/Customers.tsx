import { useEffect, useState } from "react";
import {
  Pencil,
  Trash2,
  Phone,
  Download,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { CustomerModal } from "@/components/modals/CustomerModal";

import { toast } from "sonner";

import {
  getCustomers,
  updateCustomer,
  deleteCustomer as deleteCustomerApi,
  exportCustomersCsv,
} from "@/api/customerApi";

type Customer = {
  id: string;
  name: string;
  phone: string;
  type: "retail" | "wholesale";
  pending: number;
};

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data as any);
    } catch {
      toast.error("Failed to load customers");
    }
  };

  const handleSave = async (customer: Customer) => {
    try {
      await updateCustomer(customer.id, customer);
      toast.success("Customer updated");
      setIsModalOpen(false);
      setSelectedCustomer(null);
      loadData();
    } catch {
      toast.error("Failed to update customer");
    }
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCustomerApi(id);
      toast.success("Customer deleted");
      loadData();
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleExport = async () => {
    try {
      const csv = await exportCustomersCsv();
      const blob = new Blob([csv as any], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "customers.csv";
      link.click();
    } catch {
      toast.error("Export failed");
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.phone || "").includes(searchTerm);

    const matchesType = typeFilter === "all" || customer.type === typeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">Manage your customer database</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Customer List</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Customer Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="wholesale">Wholesale</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden lg:block border rounded-lg overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b bg-muted font-medium">
              <div className="col-span-4">Name</div>
              <div className="col-span-3">Phone</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Pending</div>
              <div className="col-span-1 text-center">Edit</div>
            </div>

            {/* Rows */}
            <div className="divide-y">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-accent transition-colors"
                >
                  <div className="col-span-4 font-medium">{customer.name}</div>

                  <div className="col-span-3 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    {customer.phone}
                  </div>

                  <div className="col-span-2">
                    <Badge variant={customer.type === "wholesale" ? "default" : "secondary"}>
                      {customer.type}
                    </Badge>
                  </div>

                  <div className="col-span-2">
                    {customer.pending > 0 ? (
                      <span className="text-red-600 font-bold">₹{customer.pending.toLocaleString()}</span>
                    ) : (
                      <span className="text-green-600">₹0</span>
                    )}
                  </div>

                  {/* EDIT */}
                  <div className="col-span-1 flex justify-center">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(customer)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MOBILE CARD VIEW */}
          <div className="lg:hidden space-y-4">
            {filteredCustomers.map((customer) => (
              <Card key={customer.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="font-bold text-lg">{customer.name}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Phone className="w-3 h-3" />
                        {customer.phone}
                      </div>
                    </div>

                    <Badge variant={customer.type === "wholesale" ? "default" : "secondary"}>
                      {customer.type}
                    </Badge>
                  </div>

                  {/* Pending */}
                  {customer.pending > 0 && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="text-sm text-muted-foreground">Pending Amount</div>
                      <div className="text-lg font-bold text-red-600">₹{customer.pending.toLocaleString()}</div>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(customer)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </Button>

                    <Button variant="outline" size="sm" onClick={() => handleDelete(customer.id)}>
                      <Trash2 className="w-4 h-4 text-destructive mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* MODAL - edit only */}
      <CustomerModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave as any}
        customer={selectedCustomer || undefined}
      />
    </div>
  );
}