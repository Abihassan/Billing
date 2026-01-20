import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

type PaymentEntity = {
  id: string;
  name: string;
  phone?: string;
  pending: number;
};

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onAccept: (entityId: string, amount: number) => void;
  entity: PaymentEntity | null;
  title?: string;
}

export function PaymentModal({ open, onClose, onAccept, entity, title = 'Accept Payment' }: PaymentModalProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    setAmount(0);
    setError('');
  }, [open]);

  const handleSubmit = () => {
    if (!entity) return;

    if (amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (amount > entity.pending) {
      setError('Amount cannot be greater than pending balance');
      return;
    }

    onAccept(entity.id, amount);

    toast({
      title: 'Payment Accepted',
      description: `₹${amount.toLocaleString()} received from ${entity.name}`,
    });

    onClose();
  };

  if (!entity) return null;

  const newPending = entity.pending - amount;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Customer</Label>
            <div className="p-3 border rounded-lg bg-muted">
              <p className="font-semibold">{entity.name}</p>
              {entity.phone && <p className="text-sm text-muted-foreground">{entity.phone}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Current Pending Balance</Label>
            <div className="p-3 border rounded-lg bg-destructive/10">
              <p className="text-2xl font-bold text-destructive">₹{entity.pending.toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount Paying Today *</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              max={entity.pending}
              value={amount}
              onChange={(e) => {
                setAmount(parseFloat(e.target.value) || 0);
                setError('');
              }}
              placeholder="Enter amount"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="space-y-2">
            <Label>New Pending Balance</Label>
            <div className="p-3 border rounded-lg bg-success/10">
              <p className="text-2xl font-bold text-success">₹{newPending.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Accept Payment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}