import type { BarcodeScanner } from "../types.js";

/**
 * Most USB barcode scanners act as a "keyboard wedge": they type the barcode
 * characters very fast and end with Enter. This detects that burst pattern so
 * the POS can use a cheap, plug-and-play scanner with zero drivers.
 */
export class KeyboardWedgeScanner implements BarcodeScanner {
  private buffer = "";
  private lastKeyTime = 0;
  private handlers = new Set<(barcode: string) => void>();
  private listening = false;

  constructor(
    private readonly opts: { minLength?: number; maxInterKeyMs?: number } = {},
  ) {}

  onScan(handler: (barcode: string) => void): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  async start(): Promise<void> {
    if (this.listening) return;
    window.addEventListener("keydown", this.handleKey);
    this.listening = true;
  }

  stop(): void {
    if (!this.listening) return;
    window.removeEventListener("keydown", this.handleKey);
    this.listening = false;
    this.buffer = "";
  }

  private handleKey = (e: KeyboardEvent) => {
    const maxInterKeyMs = this.opts.maxInterKeyMs ?? 40;
    const minLength = this.opts.minLength ?? 3;
    const now = Date.now();

    // A human typing has gaps > maxInterKeyMs; a scanner does not.
    if (now - this.lastKeyTime > maxInterKeyMs) {
      this.buffer = "";
    }
    this.lastKeyTime = now;

    if (e.key === "Enter") {
      if (this.buffer.length >= minLength) {
        const code = this.buffer;
        this.handlers.forEach((h) => h(code));
      }
      this.buffer = "";
      return;
    }

    if (e.key.length === 1) {
      this.buffer += e.key;
    }
  };
}
