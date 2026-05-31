import type { Sale } from "@pos/shared";

/**
 * Platform-agnostic hardware contracts. The web app implements these with
 * WebUSB / WebSerial; a future desktop/mobile app can provide native impls.
 */

export interface ReceiptPrinter {
  readonly isConnected: boolean;
  connect(): Promise<void>;
  printReceipt(sale: Sale, opts?: { storeName?: string; footer?: string }): Promise<void>;
  openCashDrawer(): Promise<void>;
}

export interface BarcodeScanner {
  /** Subscribe to scanned codes. Returns an unsubscribe function. */
  onScan(handler: (barcode: string) => void): () => void;
  start(): Promise<void>;
  stop(): void;
}

export interface CardReader {
  readonly isConnected: boolean;
  connect(): Promise<void>;
  /** Charge an amount in minor units; resolves with a processor reference. */
  charge(amountMinor: number): Promise<{ approved: boolean; reference?: string }>;
}

export interface HardwareProvider {
  printer?: ReceiptPrinter;
  scanner?: BarcodeScanner;
  cardReader?: CardReader;
}
