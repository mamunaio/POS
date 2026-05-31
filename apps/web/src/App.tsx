import { useEffect, useMemo, useState } from "react";
import { formatMoney, type PaymentMethod, type Product } from "@pos/shared";
import { KeyboardWedgeScanner } from "@pos/hardware";
import { localDb } from "./db/local-db.js";
import { runSync } from "./sync/sync-service.js";
import { useCart } from "./pos/useCart.js";

// In a real deploy this comes from login / device config.
const BRANCH_ID = "00000000-0000-0000-0000-000000000001";

export function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [online, setOnline] = useState(navigator.onLine);
  const [status, setStatus] = useState("");
  const cart = useCart(BRANCH_ID);

  // load cached products + keep them fresh
  useEffect(() => {
    localDb.products.toArray().then(setProducts);
  }, []);

  // sync on load, on interval, and whenever we come back online
  useEffect(() => {
    let active = true;
    async function sync() {
      try {
        const r = await runSync(BRANCH_ID);
        if (!active) return;
        setProducts(await localDb.products.toArray());
        if (r.pushed || r.pulled) {
          setStatus(`Synced (pushed ${r.pushed}, pulled ${r.pulled})`);
        }
      } catch (e) {
        setStatus(`Sync failed: ${(e as Error).message}`);
      }
    }
    sync();
    const id = setInterval(sync, 30_000);
    const onOnline = () => {
      setOnline(true);
      sync();
    };
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      active = false;
      clearInterval(id);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  // barcode scanner (keyboard-wedge) -> add to cart
  useEffect(() => {
    const scanner = new KeyboardWedgeScanner();
    const off = scanner.onScan((barcode) => {
      const p = products.find((x) => x.barcode === barcode);
      if (p) cart.addProduct(p);
      else setStatus(`No product for barcode ${barcode}`);
    });
    scanner.start();
    return () => {
      off();
      scanner.stop();
    };
  }, [products, cart]);

  return (
    <div className="app">
      <header>
        <h1>POS</h1>
        <span className={online ? "badge online" : "badge offline"}>
          {online ? "Online" : "Offline"}
        </span>
        <span className="status">{status}</span>
      </header>

      <main>
        <section className="catalog">
          <h2>Products</h2>
          <div className="grid">
            {products.map((p) => (
              <button key={p.id} className="product" onClick={() => cart.addProduct(p)}>
                <span>{p.name}</span>
                <small>{formatMoney(p.priceMinor)}</small>
              </button>
            ))}
            {products.length === 0 && <p>No products yet. Start the API and seed the DB.</p>}
          </div>
        </section>

        <section className="cart">
          <h2>Cart</h2>
          {cart.items.map((it) => (
            <div key={it.productId} className="line">
              <span>{it.name}</span>
              <input
                type="number"
                min={0}
                value={it.quantity}
                onChange={(e) => cart.setQuantity(it.productId, Number(e.target.value))}
              />
              <span>{formatMoney(it.unitPriceMinor * it.quantity)}</span>
            </div>
          ))}

          <div className="totals">
            <div>Subtotal: {formatMoney(cart.totals.subtotalMinor)}</div>
            <div>Tax: {formatMoney(cart.totals.taxMinor)}</div>
            <strong>Total: {formatMoney(cart.totals.totalMinor)}</strong>
          </div>

          <div className="pay">
            {(["cash", "card", "mobile"] as PaymentMethod[]).map((m) => (
              <button
                key={m}
                disabled={cart.items.length === 0}
                onClick={async () => {
                  await cart.checkout(m);
                  setStatus(`Sale saved (${m}). Will sync when online.`);
                  runSync(BRANCH_ID).catch(() => {});
                }}
              >
                Pay {m}
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
