import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SaleItem {
  productName: string;
  quantity: number;
  price: number;
  priceType: 'retail' | 'wholesale';
}

interface Sale {
  invoiceNumber: string;
  date: string | Date;
  createdAt?: string | Date;
  customerName: string;
  customerType: string;
  items: SaleItem[];
  subtotal: number;
  total: number;
  paid: number;
  pending: number;
  previousPending?: number;
  paymentMethod: string;
}

interface InvoiceModalProps {
  open: boolean;
  onClose: () => void;
  sale: Sale | null;
}

const COMPANY_INFO = {
  name: 'AK Digital Color Studio',
  address: 'Ambur',
  phone: '+91 8056056166',
  email: 'akdigitalcolorlab@gmail.com',
  gstin: '347421567',
};

export function InvoiceModal({ open, onClose, sale }: InvoiceModalProps) {
  const { toast } = useToast();
  if (!sale) return null;

  const totalPending = (sale.previousPending || 0) + sale.pending;

  const formatDate = (ts?: string | Date) => {
    if (!ts) return '';
    const d = new Date(ts);
    return (
      d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }) +
      ' ' +
      d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    );
  };

  const handlePrint = () => {
    setTimeout(() => {
      window.print();
    }, 300);
    toast({ title: 'Printing', description: 'Invoice sent to printer' });
  };


  const handleShare = () => {
    const itemsText = sale.items
      .map(
        (item) =>
          `${item.productName} - ${item.priceType.toUpperCase()} ₹${item.price} x ${item.quantity} = ₹${(
            item.price * item.quantity
          ).toLocaleString()}`
      )
      .join('\n');

    const invoiceText = `
Invoice: ${sale.invoiceNumber}
Date: ${formatDate(sale.date)}
Customer: ${sale.customerName}
Type: ${sale.customerType}

Items:
${itemsText}

Subtotal: ₹${sale.subtotal.toLocaleString()}
Total: ₹${sale.total.toLocaleString()}
Paid: ₹${sale.paid.toLocaleString()}
Pending: ₹${sale.pending.toLocaleString()}
Previous Pending: ₹${sale.previousPending?.toLocaleString() || 0}
Total Pending: ₹${totalPending.toLocaleString()}

${COMPANY_INFO.name}
Phone: ${COMPANY_INFO.phone}
`.trim();

    window.open(`https://wa.me/?text=${encodeURIComponent(invoiceText)}`, '_blank');
    toast({ title: 'Sharing', description: 'Opening WhatsApp' });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto print:max-w-full print:p-0">
        <DialogHeader className="print:hidden">
          <DialogTitle>Invoice</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-6" id="invoice-print">
          {/* Header */}
          <div className="text-center border-b pb-4">
            <h1 className="text-2xl font-bold">{COMPANY_INFO.name}</h1>
            <p className="text-sm text-muted-foreground">{COMPANY_INFO.address}</p>
            <p className="text-sm text-muted-foreground">
              Phone: {COMPANY_INFO.phone} | Email: {COMPANY_INFO.email}
            </p>
            <p className="text-sm text-muted-foreground">GSTIN: {COMPANY_INFO.gstin}</p>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Invoice #</span>
              <p className="font-semibold">{sale.invoiceNumber}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Date</span>
              <p className="font-semibold">{formatDate(sale.date)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Customer</span>
              <p className="font-semibold">{sale.customerName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Customer Type</span>
              <p className="font-semibold capitalize">{sale.customerType}</p>
            </div>
          </div>

          {/* Items */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Item</th>
                  <th className="text-right py-2">Qty</th>
                  <th className="text-right py-2">Price</th>
                  <th className="text-right py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2">
                      {item.productName}
                      <br />
                      <span className="text-xs text-muted-foreground">
                        ({item.priceType})
                      </span>
                    </td>
                    <td className="text-right">{item.quantity}</td>
                    <td className="text-right">₹{item.price.toLocaleString()}</td>
                    <td className="text-right">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="space-y-1 border-t pt-3 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{sale.subtotal.toLocaleString()}</span>
            </div>

            {sale.previousPending !== undefined && sale.previousPending > 0 && (
              <div className="flex justify-between">
                <span>Previous Pending</span>
                <span className="font-semibold text-orange-600">
                  ₹{sale.previousPending.toLocaleString()}
                </span>
              </div>
            )}

            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total</span>
              <span>₹{sale.total.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-green-600">
              <span>Paid</span>
              <span className="font-semibold">₹{sale.paid.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-red-500">
              <span>New Pending</span>
              <span className="font-semibold">₹{sale.pending.toLocaleString()}</span>
            </div>

            <div className="flex justify-between">
              <span>Total Pending</span>
              <span className="font-bold text-red-700">
                ₹{totalPending.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="text-center text-xs border-t pt-2 text-muted-foreground">
            Thank you for your business!
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 print:hidden">
          <Button className="flex-1" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button className="flex-1" variant="outline" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
