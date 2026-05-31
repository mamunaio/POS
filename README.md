<div align="center">

# 🛒 POS

### Cloud Point-of-Sale System

**Offline-first • Multi-branch • Hardware-ready**

A modern POS built web-first as an installable PWA, with a clean monorepo so a mobile app can be added later without rewriting business logic. Sells even with no internet, then syncs every branch to the cloud.

<br/>

![Status](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-%E2%89%A520-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?logo=nestjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-offline--first-5A0FC8?logo=pwa&logoColor=white)

</div>

---

## 📑 Table of Contents

- [Highlights](#-highlights)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Monorepo Layout](#-monorepo-layout)
- [Getting Started](#-getting-started)
- [Offline & Sync Model](#-offline--sync-model)
- [Hardware Support](#-hardware-support)
- [API Reference](#-api-reference)
- [Data Model](#-data-model)
- [Scripts](#-scripts)
- [Switching to PostgreSQL](#-switching-to-postgresql)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## ✨ Highlights

| | Feature | Description |
|---|---|---|
| 🌐 | **Web-first PWA** | Installable, works on desktop and tablet browsers. Mobile app planned next. |
| 📴 | **Offline-first** | Sales are saved locally first (IndexedDB) with a client-generated UUID, so the counter never stops — even with zero connectivity. |
| 🔄 | **Multi-branch sync** | Each device pushes queued sales (idempotent) and pulls product deltas from the cloud. |
| 🖨️ | **Hardware-ready** | Receipt printer, barcode scanner, cash drawer, and card reader behind clean interfaces. |
| 💰 | **Safe money math** | All amounts stored as integer minor units (paisa/cents) — no floating-point rounding bugs. |
| ✅ | **End-to-end types** | Shared Zod schemas validate data and generate types reused across web, API, and (later) mobile. |

---

## 🧰 Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Web UI** | React 18 + Vite + `vite-plugin-pwa` | Fast DX, installable offline app shell |
| **Local store** | Dexie (IndexedDB) | Offline product cache + sale queue |
| **Backend** | NestJS 10 (Express) | Structured, modular REST + sync endpoints |
| **ORM / DB** | Prisma 5 → SQLite (dev) / PostgreSQL (prod) | One schema, swap providers per environment |
| **Validation** | Zod | Single source of truth for domain shapes |
| **Language** | TypeScript 5.6 | Type safety across the whole monorepo |
| **Tooling** | npm workspaces | Shared packages, one install, simple wiring |

---

## 🏗 Architecture

```
                          ┌──────────────────────────────┐
                          │            Cloud              │
                          │   ┌──────────────────────┐    │
                          │   │     NestJS API        │    │
                          │   │  products / sales     │    │
                          │   │  /sync/push  /pull    │    │
                          │   └──────────┬───────────┘    │
                          │              │ Prisma          │
                          │      ┌───────┴────────┐        │
                          │      │  PostgreSQL     │        │
                          │      │  (dev: SQLite)  │        │
                          │      └────────────────┘        │
                          └──────────────┬───────────────┘
                                         │  HTTPS (sync)
                ┌────────────────────────┼────────────────────────┐
                │                        │                        │
        ┌───────┴────────┐      ┌────────┴───────┐      ┌─────────┴──────┐
        │  Branch A      │      │  Branch B      │      │  Branch C ...  │
        │  React PWA     │      │  React PWA     │      │  React PWA     │
        │  ┌──────────┐  │      │  ┌──────────┐  │      │                │
        │  │ IndexedDB│  │      │  │ IndexedDB│  │      │   (offline     │
        │  │ products │  │      │  │ products │  │      │    capable)    │
        │  │ sale queue│ │      │  │ sale queue│ │      │                │
        │  └──────────┘  │      │  └──────────┘  │      │                │
        │  🖨 🔍 💵 💳     │      │  🖨 🔍 💵 💳     │      │                │
        └────────────────┘      └────────────────┘      └────────────────┘
```

The **`@pos/shared`** package holds domain types, Zod validation, money helpers, and the sync contract — so the web app, API, and a future mobile app all speak exactly the same language.

---

## 📂 Monorepo Layout

```
pos/
├── apps/
│   ├── api/                  # NestJS backend
│   │   └── src/
│   │       ├── products/     # product catalog endpoints
│   │       ├── sales/        # sale creation + listing
│   │       └── sync/         # push / pull sync endpoints
│   └── web/                  # React + Vite PWA (POS UI)
│       └── src/
│           ├── api/          # HTTP client to the backend
│           ├── db/           # Dexie (IndexedDB) local store
│           ├── pos/          # cart logic (useCart)
│           └── sync/         # offline sync service
│
├── packages/
│   ├── shared/               # domain types + Zod + money + sync contracts
│   ├── db/                   # Prisma schema, client, seed
│   └── hardware/             # printer / scanner / drawer / card-reader interfaces
│
├── docker-compose.yml        # local PostgreSQL (production path)
├── tsconfig.base.json        # shared TS config + path aliases
└── package.json              # npm workspaces root
```

> 📱 **Adding mobile later:** drop in `apps/mobile` (React Native). It reuses `@pos/shared` (types, totals, sync contracts) and provides native implementations of the `@pos/hardware` interfaces — no business logic rewrite.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js ≥ 20** (developed on Node 24)
- npm 10+
- *(Optional for production DB)* Docker, for PostgreSQL

### Quick start (local dev — uses SQLite, zero DB install)

```bash
# 1. Clone
git clone https://github.com/mamunaio/POS.git
cd POS

# 2. Install all workspaces
npm install

# 3. Create your env file
copy .env.example .env        # Windows
# cp .env.example .env        # macOS / Linux

# 4. Create the database schema + seed sample data
npm run db:generate
npm run db:migrate
npm run --workspace=@pos/db seed

# 5. Run API and Web (two terminals)
npm run dev:api               # http://localhost:3000
npm run dev:web               # http://localhost:5173
```

Open **http://localhost:5173** and you'll see two seeded products ready to sell.

> 💡 Local dev defaults to **SQLite** so you can run instantly with nothing to install. The production target is **PostgreSQL** — see [Switching to PostgreSQL](#-switching-to-postgresql).

---

## 📴 Offline & Sync Model

POS is built so the **counter never stops**, even with no internet.

1. **Products are cached locally** in IndexedDB on first sync.
2. **Sales are written locally first** with a client-generated UUID, then queued.
3. **`runSync()`** runs on load, every 30 seconds, and whenever the device reconnects:
   - **Push** — uploads queued sales. The API upserts by UUID, so re-sending the same sale is **idempotent** (no duplicates).
   - **Pull** — downloads products changed since the last sync (`updatedAt > since`), a lightweight **delta sync**.

```
 Sale created  ──►  IndexedDB queue (synced: 0)
                          │
                online?   │  every 30s / on reconnect
                          ▼
        POST /sync/push  ──►  API upsert by UUID  ──►  mark synced: 1
        GET  /sync/pull  ◄──  product deltas       ◄──  refresh local cache
```

A live **Online / Offline** badge and status line in the UI show exactly what's happening.

---

## 🔌 Hardware Support

All devices sit behind platform-agnostic interfaces in **`@pos/hardware`**, so the UI never touches hardware details directly.

| Device | Interface | Status |
|---|---|---|
| 🔍 Barcode scanner | `BarcodeScanner` | ✅ `KeyboardWedgeScanner` included (plug-and-play USB, no drivers) |
| 🖨 Receipt printer | `ReceiptPrinter` | 🧩 Interface ready (WebUSB/WebSerial impl pluggable) |
| 💵 Cash drawer | `ReceiptPrinter.openCashDrawer()` | 🧩 Interface ready (kick via printer) |
| 💳 Card reader | `CardReader` | 🧩 Interface ready (processor impl pluggable) |

The included **keyboard-wedge scanner** detects the fast "type + Enter" burst pattern that USB scanners emit, so cheap off-the-shelf scanners work with zero configuration. Native printer and card-reader implementations can be added per platform without changing any UI code.

---

## 📡 API Reference

Base URL: `http://localhost:3000`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/products` | List products (optional `?q=` search by name/sku/barcode) |
| `GET` | `/products/by-barcode?barcode=` | Look up a single product by barcode |
| `POST` | `/products` | Create a product (validated by Zod) |
| `GET` | `/sales?branchId=` | List recent sales (latest 100) |
| `POST` | `/sales` | Create a sale (totals computed server-side, idempotent by id) |
| `POST` | `/sync/push` | Upload queued offline sales `{ branchId, sales[] }` |
| `GET` | `/sync/pull?branchId=&since=` | Download product deltas since `since` |

> ⚠️ **Security note:** the API currently has **no authentication**. Add JWT/session auth and per-branch access control before any production deployment.

---

## 🗄 Data Model

```
Branch ───< Sale ───< SaleItem >─── Product

Branch    : id, name, address, active, updatedAt
Product   : id, sku, barcode, name, priceMinor, taxRateBps, stock, active, updatedAt
Sale      : id (device UUID), branchId, subtotalMinor, taxMinor, totalMinor,
            paymentMethod, soldAt, updatedAt
SaleItem  : id, saleId, productId, name, quantity, unitPriceMinor, taxRateBps
```

- **Money** is stored as integer **minor units** (`priceMinor` = paisa/cents).
- **Tax** is stored as **basis points** (`taxRateBps`): `1500` = 15%.
- Every table carries `updatedAt` to power delta sync.

---

## 📜 Scripts

Run from the repo root:

| Command | What it does |
|---|---|
| `npm run dev:api` | Start the NestJS API (watch mode) |
| `npm run dev:web` | Start the Vite web dev server |
| `npm run build` | Build the web PWA for production |
| `npm run typecheck` | Type-check every workspace |
| `npm run db:generate` | Generate the Prisma client |
| `npm run db:migrate` | Apply database migrations |
| `npm run db:up` / `db:down` | Start / stop PostgreSQL via Docker |
| `npm run --workspace=@pos/db seed` | Seed sample branch + products |

---

## 🐘 Switching to PostgreSQL

Local dev uses SQLite for convenience. To use PostgreSQL (the production / multi-branch target):

1. **Start PostgreSQL** (Docker):
   ```bash
   npm run db:up
   ```
2. **Point Prisma at Postgres** in `packages/db/prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. **Set the connection string** in `.env`:
   ```env
   DATABASE_URL="postgresql://pos:pos@localhost:5432/pos?schema=public"
   ```
4. **Migrate**:
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

> The domain code is identical across both databases — only the Prisma provider and connection string change.

---

## 🗺 Roadmap

- [ ] Authentication (JWT) + per-branch access control
- [ ] Receipt printer implementation (WebUSB / ESC-POS)
- [ ] Card reader / payment processor integration
- [ ] Product & inventory management screens
- [ ] Sales reports and dashboards
- [ ] `apps/mobile` (React Native) reusing shared packages
- [ ] Role-based users (cashier, manager, admin)

---

## 📄 License

Released under the **MIT License**.

<div align="center">
<br/>
Built with care for shops that can't afford to stop selling. 🛒
</div>
