import { Product } from "@/types";
import { toCamel, toSnake } from "@/utils/casing";

const API_BASE = "http://127.0.0.1:8000/api/products";

// ---------------------
// HANDLE RESPONSE
// ---------------------
async function handleRes(res: Response) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return res.json();

  return res.text();
}

// ---------------------
// GET ALL PRODUCTS
// ---------------------
export async function getProducts(): Promise<Product[]> {
  const res = await fetch(API_BASE);
  const json = await handleRes(res);
  return json.map((p: any) => toCamel(p));
}

// ---------------------
// GET SINGLE PRODUCT
// ---------------------
export async function getProduct(id: string): Promise<Product> {
  const res = await fetch(`${API_BASE}/${id}`);
  const json = await handleRes(res);
  return toCamel(json);
}

// ---------------------
// CREATE PRODUCT
// ---------------------
export async function createProduct(payload: Omit<Product, "id">): Promise<Product> {
  const body = JSON.stringify(toSnake(payload));
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  const json = await handleRes(res);
  return toCamel(json);
}

// ---------------------
// UPDATE PRODUCT
// ---------------------
export async function updateProduct(
  id: string,
  payload: Partial<Omit<Product, "id">>
): Promise<Product> {
  const body = JSON.stringify(toSnake(payload));
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body,
  });

  const json = await handleRes(res);
  return toCamel(json);
}

// ---------------------
// DELETE PRODUCT
// ---------------------
export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Delete failed");
}

// Export CSV (same)
export async function exportProductsCsv(): Promise<string> {
  const res = await fetch(`${API_BASE}/export`, { method: "GET" });
  return await res.text();
}

/* Auto Reduce Stock (same) */
export async function reduceStock(productId: string, quantity: number): Promise<Product> {
  const body = JSON.stringify({ quantity });
  const res = await fetch(`${API_BASE}/${productId}/reduce-stock`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body,
  });
  const json = await handleRes(res);
  return toCamel(json);
}
