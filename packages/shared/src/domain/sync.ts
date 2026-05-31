import { z } from "zod";
import { SaleSchema } from "./sale.js";
import { ProductSchema } from "./product.js";

/**
 * Offline-first sync contract between a branch device and the cloud API.
 * Device pushes locally-created sales, then pulls anything updated since
 * its last successful sync (delta sync keyed by updatedAt).
 */
export const SyncPushSchema = z.object({
  branchId: z.string().uuid(),
  sales: z.array(SaleSchema),
});

export type SyncPush = z.infer<typeof SyncPushSchema>;

export const SyncPullQuerySchema = z.object({
  branchId: z.string().uuid(),
  /** ISO timestamp of the device's last successful pull */
  since: z.string().datetime().optional(),
});

export type SyncPullQuery = z.infer<typeof SyncPullQuerySchema>;

export const SyncPullResultSchema = z.object({
  serverTime: z.string().datetime(),
  products: z.array(ProductSchema),
});

export type SyncPullResult = z.infer<typeof SyncPullResultSchema>;
