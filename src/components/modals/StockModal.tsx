import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

type ProductLite = {
  id: string;
  name: string;
  category: string;
  stock: number;
};

interface StockModalProps {
  open: boolean;
  onClose: () => void;
  onUpdate: (productId: string, quantity: number) => void;
  onCreate?: (data: {
    name: string;
    category: string;
    quantity: number;
    unit: string;
    min_threshold: number | null;
    linked_product_id: string | null;
  }) => void;
  product: ProductLite | null;
}

export function StockModal({ open, onClose, onUpdate, onCreate, product }: StockModalProps) {
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(0);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setQuantity(0);
    setError('');

    if (product) {
      setName(product.name);
      setCategory(product.category);
    } else {
      setName('');
      setCategory('');
    }
  }, [open, product]);

  const handleSubmit = () => {
    // CREATE MODE
    if (!product) {
      if (!name.trim() || !category.trim()) {
        setError('Name & category required');
        return;
      }

      if (!onCreate) return;

      onCreate({
        name,
        category,
        quantity: quantity > 0 ? quantity : 0,
        unit: 'pcs',
        min_threshold: null,
        linked_product_id: null,
      });

      toast({ title: 'Stock Item Created' });
      return onClose();
    }

    // UPDATE MODE
    if (quantity === 0) {
      setError('Quantity must not be 0');
      return;
    }

    if (quantity < 0 && Math.abs(quantity) > product.stock) {
      setError('Cannot reduce more than current stock');
      return;
    }

    onUpdate(product.id, quantity);
    toast({ title: 'Stock Updated' });
    onClose();
  };

  const newStock = product ? product.stock + quantity : quantity;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{product ? 'Update Stock' : 'Add Stock Item'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* CREATE MODE FIELDS */}
          {!product && (
            <>
              <div>
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div>
                <Label>Category</Label>
                <Input value={category} onChange={(e) => setCategory(e.target.value)} />
              </div>
            </>
          )}

          {/* SHARED FIELD */}
          <div>
            <Label>Add/Remove Quantity</Label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
              placeholder="Positive to add, negative to remove"
            />
          </div>

          {error && <p className="text-red-500">{error}</p>}

          {/* NEW STOCK PREVIEW */}
          <div>
            <Label>New Stock</Label>
            <div className={`p-3 border rounded-lg ${newStock < 10 ? 'bg-destructive/10' : 'bg-green-100'}`}>
              <p className={`text-2xl font-bold ${newStock < 10 ? 'text-destructive' : 'text-green-600'}`}>
                {newStock} units
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>{product ? 'Update' : 'Create'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
