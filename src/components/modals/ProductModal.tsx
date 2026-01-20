import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Product } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id'> | Product) => void;
  product?: Product;
}

const categories = [
  'Frames',
  'Albums',
  'Mugs',
  'Passport Photos',
  'Printing',
  'Other'
];

export function ProductModal({ open, onClose, onSave, product }: ProductModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    retailPrice: 0,
    wholesalePrice: 0,
    isWholesaleOnly: false,
    stock: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        retailPrice: product.retailPrice,
        wholesalePrice: product.wholesalePrice,
        isWholesaleOnly: product.isWholesaleOnly,
        stock: product.stock
      });
    } else {
      setFormData({
        name: '',
        category: '',
        retailPrice: 0,
        wholesalePrice: 0,
        isWholesaleOnly: false,
        stock: 0
      });
    }
    setErrors({});
  }, [product, open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (formData.retailPrice <= 0)
      newErrors.retailPrice = 'Retail price must be greater than 0';
    if (formData.wholesalePrice <= 0)
      newErrors.wholesalePrice = 'Wholesale price must be greater than 0';
    if (formData.stock < 0) newErrors.stock = 'Stock cannot be negative';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        variant: 'destructive'
      });
      return;
    }

    if (product) {
      onSave({ ...product, ...formData });
    } else {
      onSave(formData);
    }

    toast({
      title: 'Success',
      description: `Product ${product ? 'updated' : 'created'} successfully`
    });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter product name"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category}</p>
            )}
          </div>

          {/* Retail + Wholesale Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="retailPrice">Retail Price (₹) *</Label>
              <Input
                type="number"
                min="1"
                value={formData.retailPrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    retailPrice: parseFloat(e.target.value) || 0
                  })
                }
              />
              {errors.retailPrice && (
                <p className="text-sm text-destructive">{errors.retailPrice}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="wholesalePrice">Wholesale Price (₹) *</Label>
              <Input
                type="number"
                min="1"
                value={formData.wholesalePrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    wholesalePrice: parseFloat(e.target.value) || 0
                  })
                }
              />
              {errors.wholesalePrice && (
                <p className="text-sm text-destructive">{errors.wholesalePrice}</p>
              )}
            </div>
          </div>

          {/* Stock */}
          <div className="space-y-2">
            <Label htmlFor="stock">Stock *</Label>
            <Input
              type="number"
              min="0"
              value={formData.stock}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  stock: parseInt(e.target.value) || 0
                })
              }
            />
            {errors.stock && (
              <p className="text-sm text-destructive">{errors.stock}</p>
            )}
          </div>

          {/* Wholesale only checkbox */}
          <div className="flex items-center space-x-2">
            <input
              id="isWholesaleOnly"
              type="checkbox"
              checked={formData.isWholesaleOnly}
              onChange={(e) =>
                setFormData({ ...formData, isWholesaleOnly: e.target.checked })
              }
            />
            <Label htmlFor="isWholesaleOnly">
              This product only sells in wholesale
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {product ? 'Update Product' : 'Create Product'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
