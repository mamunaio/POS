import type { Product, Sale, SyncPullResult } from "@pos/shared";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

export const api = {
  async pull(branchId: string, since?: string): Promise<SyncPullResult> {
    const params = new URLSearchParams({ branchId });
    if (since) params.set("since", since);
    return json(await fetch(`${API_URL}/sync/pull?${params}`));
  },

  async push(branchId: string, sales: Sale[]): Promise<{ accepted: number }> {
    return json(
      await fetch(`${API_URL}/sync/push`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ branchId, sales }),
      }),
    );
  },

  async listProducts(): Promise<Product[]> {
    return json(await fetch(`${API_URL}/products`));
  },
};
