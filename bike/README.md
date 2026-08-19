# ridegoa 🏍️ — Goa bike marketplace (mock)

A frontend-only mock of a Goa two-wheeler rental marketplace built on **TanStack Start + React 19 + Tailwind CSS v4 + shadcn/ui-style primitives**. No accounts, no database — all state lives in an in-session store that flows instantly between the **Renter** and **Host** personas.

## Quick start

> ⚠️ Git Bash is currently **not installed** on this machine, so `npm` commands can't run from the assistant's terminal yet. Install [Git for Windows](https://git-scm.com/download/win) (or WSL), then:

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build
npm run start      # preview the production build
npm run typecheck  # tsc --noEmit
```

> If the TanStack Start plugin API has moved since this scaffold (caret ranges pull the latest 1.x), run `npx @tanstack/start@latest init` in a temp folder to diff `app.config.ts` / `src/server.ts` / `src/client.tsx`.

## What's inside

| Area | Route | Highlights |
| --- | --- | --- |
| Marketplace | `/` | Hero + search, category pills, price-range slider, transmission / CC / helmet / gear filters, sort, card grid ⇄ stylised **Goa map** with rate pins |
| Bike detail | modal | Gallery, owner card (verification + response time), spec grid, rental rules, availability calendar with pickup/drop-off date+time pickers, **live price breakdown** (rate×days + deposit + 8% fee + helmet add-on), **Book Now** (creates Pending request + opens chat) and **Chat with Owner** |
| Messages | `/messages` | Thread list with unread counts, pinned booking context bar, role-aware bubbles with read receipts, composer with quick-template chips, simulated photo + location-pin sharing, inline **Approve/Decline**, **Confirm handover**, **Request/accept extension** |
| My Trips | `/trips` | Active trip with **live countdown** to drop-off, emergency helpline, extension request, handover checklist launcher; past trips with review dialog; saved bikes |
| Host Studio | `/host` | Earnings + booking stats, income chart, incoming requests with approve/decline, fleet table with availability toggles, **4-step List-a-bike** form that publishes straight into the marketplace |

Plus a **handover checklist** modal (body-condition inspection, fuel slider, odometer, simulated camera capture, canvas signature) that moves a booking to *Active Rental*, posts a confirmation into chat and fires **confetti**. The navbar's **persona switcher** (Renter/Host) swaps the acting identity everywhere, including which side of chat bubbles you type from.

## Design system

- Deep charcoal base, **sunset-amber** primary + **teal** secondary, all as semantic tokens in `src/styles.css` (Tailwind v4 `@theme`).
- Glass surfaces, gradient price tags, per-status badges (`Pending` / `Confirmed` / `Active` / `Completed`), soft glow shadows.
- **Outfit** (headings) + **Inter** (body) loaded via the root route head.
- Bike "photos" are procedurally generated SVG scenes (per-category palette, Goa sunsets, palms, silhouettes) — no network images.

## MySQL integration (step 1: schema + health check)

The app ships with a MySQL 8.0 schema and seed data so you can graduate the mock store to a real database. This step wires the connection and a health check only — the store still runs in-memory until the API routes replace its actions.

**Prerequisites:** MySQL Server 8.0 running locally (Workbench is the GUI; the server is the engine).

1. **Install the driver:** `npm install` (adds `mysql2`).
2. **Create the database + tables:** open `db/schema.sql` in MySQL Workbench and run it (or `mysql -u root -p < db/schema.sql`).
3. **Seed demo data:** open `db/seed.sql` and run it (or `mysql -u root -p ridegoa < db/seed.sql`).
4. **Configure credentials:** copy `.env.example` to `.env` and set your MySQL password (`.env` is gitignored).
5. **Verify the app can talk to MySQL:** `npm run dev`, then open `http://localhost:3000/api/health` — expect `{ "ok": true, "db": { "connected": true, ... } }`.

Files:
- `db/schema.sql` — users, bikes, bookings, conversations, messages, saved_bikes (mirrors `src/store/types.ts`)
- `db/seed.sql` — the same demo data as `src/store/seed.ts` (demo password for all accounts: `demo1234`)
- `src/lib/db.ts` — server-only `mysql2/promise` pool; reads `RIDEGOA_DB_*` env vars
- `src/routes/api/health.ts` — `GET /api/health` returning DB connection status

> Security note: `src/lib/db.ts` is server-only — never import it from components or the store (it would break the client build).

## Mock notes

- Everything persists to `sessionStorage` — refresh keeps your session, closing the tab resets it.
- 6 seeded bikes (Anjuna, Baga, Candolim, Vagator, Palolem, Panjim), 4 owner profiles, 3 bookings (Pending / Active / Completed) and 3 chat threads.
- Persona switching and all booking/chat/host actions are pure store operations — swapping the store's actions for backend calls later is the entire migration path to real accounts + real-time messaging.
