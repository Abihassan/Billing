import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Customer } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface CustomerModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (customer: Omit<Customer, 'id' | 'pending'> | Customer) => void;
  customer?: Customer;
}

export function CustomerModal({ open, onClose, onSave, customer }: CustomerModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    type: 'retail' as 'retail' | 'wholesale',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        phone: customer.phone,
        type: customer.type,
      });
    } else {
      setFormData({ name: '', phone: '', type: 'retail' });
    }
    setErrors({});
  }, [customer, open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Customer name is required';
    }
    
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number (must be 10 digits starting with 6-9)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        variant: 'destructive',
      });
      return;
    }

    if (customer) {
      onSave({ ...customer, ...formData });
    } else {
      onSave(formData);
    }

    toast({
      title: 'Success',
      description: `Customer ${customer ? 'updated' : 'created'} successfully`,
    });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{customer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Customer Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter customer name"
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter 10-digit phone number"
              maxLength={10}
            />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
          </div>

          <div className="space-y-2">
            <Label>Customer Type *</Label>
            <div className="flex gap-4">
              <Button
                type="button"
                variant={formData.type === 'retail' ? 'default' : 'outline'}
                onClick={() => setFormData({ ...formData, type: 'retail' })}
                className="flex-1"
              >
                Retail
              </Button>
              <Button
                type="button"
                variant={formData.type === 'wholesale' ? 'default' : 'outline'}
                onClick={() => setFormData({ ...formData, type: 'wholesale' })}
                className="flex-1"
              >
                Wholesale
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>{customer ? 'Update' : 'Create'} Customer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
