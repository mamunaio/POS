import Dexie, { type Table } from "dexie";
import type { Product, Sale } from "@pos/shared";

/**
 * Offline-first local store. Products are cached here for fast lookup and
 * offline selling; sales are queued here until they sync to the cloud.
 */
export interface QueuedSale extends Sale {
  synced: 0 | 1;
}

export class PosLocalDB extends Dexie {
  products!: Table<Product, string>;
  sales!: Table<QueuedSale, string>;
  meta!: Table<{ key: string; value: string }, string>;

  constructor() {
    super("pos-local");
    this.version(1).stores({
      products: "id, sku, barcode, name",
      sales: "id, synced, soldAt",
      meta: "key",
    });
  }
}

export const localDb = new PosLocalDB();

export async function getMeta(key: string): Promise<string | undefined> {
  return (await localDb.meta.get(key))?.value;
}

export async function setMeta(key: string, value: string): Promise<void> {
  await localDb.meta.put({ key, value });
}
