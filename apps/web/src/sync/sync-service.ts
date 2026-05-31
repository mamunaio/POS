import type { Product } from "@pos/shared";
import { api } from "../api/client.js";
import { getMeta, localDb, setMeta } from "../db/local-db.js";

const LAST_PULL_KEY = "lastPullAt";

/**
 * Two-way sync: push queued offline sales, then pull product updates.
 * Safe to call on an interval and on "online" events. No-ops when offline.
 */
export async function runSync(branchId: string): Promise<{ pushed: number; pulled: number }> {
  if (!navigator.onLine) return { pushed: 0, pulled: 0 };

  // 1. push unsynced sales
  const pending = await localDb.sales.where("synced").equals(0).toArray();
  let pushed = 0;
  if (pending.length > 0) {
    const sales = pending.map(({ synced, ...sale }) => sale);
    await api.push(branchId, sales);
    await localDb.sales.bulkPut(pending.map((s) => ({ ...s, synced: 1 })));
    pushed = pending.length;
  }

  // 2. pull product deltas since last sync
  const since = await getMeta(LAST_PULL_KEY);
  const result = await api.pull(branchId, since);
  if (result.products.length > 0) {
    await localDb.products.bulkPut(result.products as Product[]);
  }
  await setMeta(LAST_PULL_KEY, result.serverTime);

  return { pushed, pulled: result.products.length };
}
