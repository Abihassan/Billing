// src/api/pendingApi.ts
import { Sale } from "@/types";

// Fetch all wholesale customers who have pending invoices
export async function getPendingCustomers(): Promise<any[]> {
  const res = await fetch("/api/sales?pending=true"); // backend returns sales with pending > 0
  if (!res.ok) throw new Error("Failed to fetch pending customers");

  const sales: Sale[] = await res.json();

  // Convert sale list → customer-like list
  const customersMap: Record<string, any> = {};

  sales.forEach((sale) => {
    if (!customersMap[sale.customerId]) {
      customersMap[sale.customerId] = {
        id: sale.customerId,
        name: sale.customerName,
        phone: "",
        type: "wholesale",
        pending: 0,
        invoices: []
      };
    }

    customersMap[sale.customerId].pending += sale.pending;
    customersMap[sale.customerId].invoices.push(sale);
  });

  return Object.values(customersMap);
}

// Update pending (pay invoice)
export async function updatePending(invoiceId: string, amount: number) {
  const res = await fetch(`/api/sales/${invoiceId}/pay`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount })
  });

  if (!res.ok) throw new Error("Payment failed");
  return res.json();
}
