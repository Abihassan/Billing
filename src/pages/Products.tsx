import React, { useEffect, useState } from "react";
import { Package, Plus, Pencil, Trash2, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductModal } from "@/components/modals/ProductModal";
import { Product } from "@/types";
import { useToast } from "@/hooks/use-toast";
import * as productApi from "@/api/productApi";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productApi.getProducts();
      setProducts(data);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "low" && product.stock < 5) ||
      (stockFilter === "out" && product.stock === 0) ||
      (stockFilter === "available" && product.stock >= 5);

    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleSave = async (product: Omit<Product, "id"> | Product) => {
    try {
      if ("id" in product && product.id) {
        // UPDATE
        await productApi.updateProduct(product.id, {
          name: product.name,
          category: product.category,
          retailPrice: product.retailPrice,
          wholesalePrice: product.wholesalePrice,
          isWholesaleOnly: product.isWholesaleOnly,
          stock: product.stock,
        });

        toast({ title: "Product Updated", description: "Updated successfully" });
      } else {
        // CREATE → convert camelCase → snake_case for backend
        await productApi.createProduct({
          name: product.name,
          category: product.category,
          retail_price: product.retailPrice,
          wholesale_price: product.wholesalePrice,
          is_wholesale_only: product.isWholesaleOnly ?? false,
          stock: product.stock,
        } as any);

        toast({
          title: "Product Added",
          description: "Product created successfully",
        });
      }

      fetchProducts();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Operation failed",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await productApi.deleteProduct(id);
      toast({ title: "Deleted", description: "Product removed" });
      fetchProducts();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Delete failed",
        variant: "destructive",
      });
    }
  };

  const handleAddNew = () => {
    setSelectedProduct(undefined);
    setIsModalOpen(true);
  };

  const handleExportCsv = async () => {
    try {
      const csvText = await productApi.exportProductsCsv();

      const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "products_export.csv";
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCsv}>
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button onClick={handleAddNew}>
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <Input
          placeholder="Search products..."
          className="flex-1"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat} className="capitalize">
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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
        <div className="grid [grid-template-columns:repeat(13,minmax(0,1fr))] gap-4 p-4 border-b bg-muted font-medium">
          <div className="col-span-3">Product Name</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2">Retail Price</div>
          <div className="col-span-2">Wholesale Price</div>
          <div className="col-span-2">Wholesale Only</div>
          <div className="col-span-1">Stock</div>
          <div className="col-span-1">Actions</div>
        </div>

        <div className="divide-y">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="grid [grid-template-columns:repeat(13,minmax(0,1fr))] gap-4 p-4 items-center hover:bg-accent transition-colors"
            >
              <div className="col-span-3 font-medium">{product.name}</div>
              <div className="col-span-2">{product.category}</div>
              <div className="col-span-2">₹{product.retailPrice}</div>
              <div className="col-span-2 font-bold text-blue-600">₹{product.wholesalePrice}</div>
              <div className="col-span-2">
                <Badge variant={product.isWholesaleOnly ? "default" : "outline"}>
                  {product.isWholesaleOnly ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="col-span-1">
                <Badge variant={product.stock < 5 ? "destructive" : "secondary"}>
                  {product.stock}
                </Badge>
              </div>
              
              <div className="col-span-1 flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                {product.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Category</span>
                <Badge variant="secondary">{product.category}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Retail Price</span>
                <span>₹{product.retailPrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Wholesale Price</span>
                <span className="font-bold text-blue-600">₹{product.wholesalePrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Wholesale Only</span>
                <Badge variant={product.isWholesaleOnly ? "default" : "outline"}>
                  {product.isWholesaleOnly ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Stock</span>
                <Badge variant={product.stock < 5 ? "destructive" : "secondary"}>
                  {product.stock}
                </Badge>
              </div>
              

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(product)}>
                  <Pencil className="w-4 h-4 mr-1" /> Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ProductModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        product={selectedProduct}
      />
    </div>
  );
}
