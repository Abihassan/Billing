import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CreditCard } from "lucide-react";
import { PaymentModal } from "@/components/modals/PaymentModal";
import { toast } from "sonner";
import { getPendingSales, payPending } from "@/api/salesApi";

type PendingSale = {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerType: "retail" | "wholesale";
  pending: number;
  total: number;
  paid: number;
};

export default function Pending() {
  const [sales, setSales] = useState<PendingSale[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<PendingSale | null>(null);

  useEffect(() => {
    loadPending();
  }, []);

  const loadPending = async () => {
    try {
      const data = await getPendingSales();
      setSales((data as any).map((s: any) => ({
        id: s.id,
        invoiceNumber: s.invoiceNumber,
        customerName: s.customerName,
        customerType: s.customerType,
        pending: s.pending,
        total: s.total,
        paid: s.paid,
      })));
    } catch {
      toast.error("Failed to load pending invoices");
    }
  };

  const wholesalePending = useMemo(
    () => sales.filter((s) => s.customerType === "wholesale" && s.pending > 0),
    [sales]
  );

  const totalPending = wholesalePending.reduce((sum, s) => sum + s.pending, 0);

  const handleAcceptPayment = async (saleId: string, amount: number) => {
    try {
      await payPending(saleId, amount);
      toast.success("Payment accepted");
      await loadPending(); // reload pending list
    } catch {
      toast.error("Failed to accept payment");
    }
  };

  const handleOpenPayment = (sale: PendingSale) => {
    setSelected(sale);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pending Payments</h1>
        <Badge variant="destructive" className="text-lg px-4 py-2">
          Total: ₹{totalPending.toLocaleString()}
        </Badge>
      </div>

      {wholesalePending.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Pending Payments</h3>
            <p className="text-muted-foreground">All wholesale customers have cleared their dues</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <Card className="hidden lg:block">
            <CardContent className="p-0">
              <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-12 gap-4 p-4 border-b bg-muted font-medium">
                  <div className="col-span-4">Customer Name</div>
                  <div className="col-span-3">Invoice</div>
                  <div className="col-span-3">Pending Amount</div>
                  <div className="col-span-2">Actions</div>
                </div>

                <div className="divide-y max-h-[450px] overflow-y-auto">
                  {wholesalePending.map((sale) => (
                    <div
                      key={sale.id}
                      className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-accent transition-colors"
                    >
                      <div className="col-span-4 font-medium">{sale.customerName}</div>
                      <div className="col-span-3">{sale.invoiceNumber}</div>
                      <div className="col-span-3 font-bold text-red-600">₹{sale.pending.toLocaleString()}</div>
                      <div className="col-span-2">
                        <Button size="sm" className="w-full" onClick={() => handleOpenPayment(sale)}>
                          <CreditCard className="w-4 h-4 mr-1" />
                          Pay
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {wholesalePending.map((sale) => (
              <Card key={sale.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{sale.customerName}</span>
                    <Badge variant="outline">{sale.invoiceNumber}</Badge>
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pending Balance</span>
                    <span className="font-bold text-red-600 text-lg">₹{sale.pending.toLocaleString()}</span>
                  </div>

                  <Button className="w-full" onClick={() => handleOpenPayment(sale)}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Accept Payment
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Payment Modal */}
      <PaymentModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAccept={handleAcceptPayment}
        entity={
          selected
            ? { id: selected.id, name: `${selected.customerName} (${selected.invoiceNumber})`, pending: selected.pending }
            : null
        }
        title="Accept Payment for Invoice"
      />
    </div>
  );
}