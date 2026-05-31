import { useMemo, useState } from "react";
import { v4 as uuid } from "uuid";
import {
  computeSaleTotals,
  type PaymentMethod,
  type Product,
  type Sale,
  type SaleItem,
} from "@pos/shared";
import { localDb } from "../db/local-db.js";

export function useCart(branchId: string) {
  const [items, setItems] = useState<SaleItem[]>([]);

  const totals = useMemo(() => computeSaleTotals(items), [items]);

  function addProduct(product: Product) {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          quantity: 1,
          unitPriceMinor: product.priceMinor,
          taxRateBps: product.taxRateBps,
        },
      ];
    });
  }

  function setQuantity(productId: string, quantity: number) {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.productId !== productId)
        : prev.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
    );
  }

  function clear() {
    setItems([]);
  }

  /** Persist the sale locally first (offline-safe); sync pushes it later. */
  async function checkout(paymentMethod: PaymentMethod): Promise<Sale> {
    const now = new Date().toISOString();
    const sale: Sale = {
      id: uuid(),
      branchId,
      items,
      ...totals,
      paymentMethod,
      soldAt: now,
      updatedAt: now,
    };
    await localDb.sales.put({ ...sale, synced: 0 });
    clear();
    return sale;
  }

  return { items, totals, addProduct, setQuantity, clear, checkout };
}
