import { z } from "zod";

export const PaymentMethod = z.enum(["cash", "card", "mobile"]);
export type PaymentMethod = z.infer<typeof PaymentMethod>;

export const SaleItemSchema = z.object({
  productId: z.string().uuid(),
  name: z.string(),
  quantity: z.number().int().positive(),
  unitPriceMinor: z.number().int().nonnegative(),
  taxRateBps: z.number().int().min(0).max(10000),
});

export type SaleItem = z.infer<typeof SaleItemSchema>;

export const SaleSchema = z.object({
  /** client-generated UUID so offline sales have a stable id before sync */
  id: z.string().uuid(),
  branchId: z.string().uuid(),
  items: z.array(SaleItemSchema).min(1),
  subtotalMinor: z.number().int().nonnegative(),
  taxMinor: z.number().int().nonnegative(),
  totalMinor: z.number().int().nonnegative(),
  paymentMethod: PaymentMethod,
  /** when the sale happened on the device (offline-safe) */
  soldAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Sale = z.infer<typeof SaleSchema>;

export const CreateSaleSchema = SaleSchema.omit({
  subtotalMinor: true,
  taxMinor: true,
  totalMinor: true,
  updatedAt: true,
});

export type CreateSale = z.infer<typeof CreateSaleSchema>;

/** Compute totals from line items. Single source of truth used by web + api. */
export function computeSaleTotals(items: SaleItem[]) {
  let subtotalMinor = 0;
  let taxMinor = 0;
  for (const item of items) {
    const line = item.unitPriceMinor * item.quantity;
    subtotalMinor += line;
    taxMinor += Math.round((line * item.taxRateBps) / 10000);
  }
  return {
    subtotalMinor,
    taxMinor,
    totalMinor: subtotalMinor + taxMinor,
  };
}
