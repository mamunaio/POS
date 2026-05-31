import { z } from "zod";

export const ProductSchema = z.object({
  id: z.string().uuid(),
  sku: z.string().min(1),
  barcode: z.string().nullable().optional(),
  name: z.string().min(1),
  /** price in minor units (e.g. paisa) */
  priceMinor: z.number().int().nonnegative(),
  /** tax rate as basis points: 1500 = 15% */
  taxRateBps: z.number().int().min(0).max(10000).default(0),
  stock: z.number().int().default(0),
  active: z.boolean().default(true),
  updatedAt: z.string().datetime(),
});

export type Product = z.infer<typeof ProductSchema>;

export const CreateProductSchema = ProductSchema.omit({
  id: true,
  updatedAt: true,
});

export type CreateProduct = z.infer<typeof CreateProductSchema>;
