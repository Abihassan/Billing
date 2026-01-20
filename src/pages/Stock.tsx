import React, { useEffect, useState } from "react";
import { Package, Edit, Trash2, Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { StockModal } from "@/components/modals/StockModal";
import { useToast } from "@/hooks/use-toast";

import * as stockApi from "@/api/stockApi"; 
import type { StockItem } from "@/types";

export default function Stock() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all"); // New stock filter

  const { toast } = useToast();

  // Fetch stock items
  const fetchStock = async () => {
    try {
      const data = await stockApi.getStockItems();
      setItems(data);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load stock items",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  // CSV Export
  const handleExportCsv = async () => {
    try {
      const blob = await stockApi.exportStockCsv();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "stock_export.csv";
      document.body.appendChild(link);
      link.click();

      link.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      toast({
        title: "Export Failed",
        description: err.message || "Could not export CSV",
        variant: "destructive",
      });
    }
  };

  // Update stock quantity
  const handleUpdateStock = async (itemId: string, quantity: number) => {
    try {
      await stockApi.adjustStockQuantity(itemId, quantity);

      toast({
        title: "Stock Updated",
        description: `Stock adjusted successfully.`,
      });

      fetchStock();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Stock update failed",
        variant: "destructive",
      });
    }
  };

  // Create new stock item
  const handleCreateItem = async (data: {
    name: string;
    category: string;
    quantity: number;
    unit: string;
    min_threshold: number | null;
    linked_product_id: string | null;
  }) => {
    try {
      await stockApi.createStockItem(data);
      toast({ title: "Item Created" });
      fetchStock();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Creation failed",
        variant: "destructive",
      });
    }
  };

  // Delete stock item
  const handleDeleteItem = async (id: string) => {
    try {
      await stockApi.deleteStockItem(id);

      toast({
        title: "Deleted",
        description: "Stock item removed successfully.",
      });

      fetchStock();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Delete failed",
        variant: "destructive",
      });
    }
  };

  const handleAddNew = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: StockItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  // Filters (with stock filter like product search)
  const filteredItems = items.filter((i) => {
    const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || i.category === categoryFilter;
    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "low" && i.quantity < 10) ||
      (stockFilter === "out" && i.quantity === 0) ||
      (stockFilter === "available" && i.quantity >= 10);

    return matchesSearch && matchesCategory && matchesStock;
  });

  const maxStock = Math.max(...items.map((i) => i.quantity), 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Stock Management</h1>
          <p className="text-muted-foreground">Manage available stock quantity</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCsv}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          <Button onClick={handleAddNew}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-2 items-center">
        <Input
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Category Filter" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {[...new Set(items.map((i) => i.category))].map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Stock Filter */}
        <Select value={stockFilter} onValueChange={setStockFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Stock Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="low">Low Stock</SelectItem>
            <SelectItem value="out">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block border rounded-lg overflow-hidden">
        <div className="grid grid-cols-5 gap-4 p-4 border-b bg-muted font-medium">
          <div>Name</div>
          <div>Category</div>
          <div>Stock</div>
          <div>Progress</div>
          <div>Actions</div>
        </div>

        <div className="divide-y">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-5 gap-4 p-4 items-center hover:bg-accent transition-colors"
            >
              <div className="font-medium">{item.name}</div>
              <div>{item.category}</div>

              <div
                className={`font-bold ${
                  item.quantity < 10 ? "text-destructive" : "text-green-600"
                }`}
              >
                {item.quantity} units
              </div>

              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    item.quantity < 10 ? "bg-destructive" : "bg-green-600"
                  }`}
                  style={{ width: `${(item.quantity / maxStock) * 100}%` }}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                  <Edit className="w-4 h-4 mr-1" />
                  Update
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteItem(item.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {filteredItems.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                {item.name}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Category</span>
                <span className="font-medium">{item.category}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Stock</span>
                <span
                  className={`font-bold ${
                    item.quantity < 10 ? "text-destructive" : "text-green-600"
                  }`}
                >
                  {item.quantity} units
                </span>
              </div>

              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    item.quantity < 10 ? "bg-destructive" : "bg-green-600"
                  }`}
                  style={{ width: `${(item.quantity / maxStock) * 100}%` }}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => handleEdit(item)}>
                  <Edit className="w-4 h-4 mr-1" />
                  Update
                </Button>

                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => handleDeleteItem(item.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal */}
      <StockModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={handleUpdateStock}
        onCreate={handleCreateItem}
        product={
          selectedItem
            ? {
                id: selectedItem.id,
                name: selectedItem.name,
                category: selectedItem.category,
                stock: selectedItem.quantity,
              }
            : null
        }
      />
    </div>
  );
}
