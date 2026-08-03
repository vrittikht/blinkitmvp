# Category Quest — Architecture (Phase-wise)

This document describes how the **user-facing MVP** is built in phases. Each phase delivers a working user slice that composes into the full journey in [problemstatement.md](./problemstatement.md). No admin analytics or stakeholder dashboards.

## Repository layout

**One hosted app** — root `frontend/` + `backend/` (deploy to Vercel + Railway).

`phase-0/`, `phase-1/`, `phase-2/` are local **snapshots** for reference only; they are not separate hosted services.

```
frontend/   Next.js (Vercel)     ← deploy this
backend/    FastAPI (Railway)    ← deploy this
phase-*/    historical copies of earlier milestones (0–5)
```

Prefer developing and running the root app. After finishing a phase, you may snapshot into `phase-N/` if you want a freeze; the hosted product stays singular.

---

## System at a glance

```
┌─────────────────────────────┐         ┌──────────────────────────────┐
│  Frontend (Next.js 15)      │  REST   │  Backend (FastAPI)           │
│  Vercel                     │◄───────►│  Railway                     │
│                             │  JSON   │                              │
│  Home · Catalog · Cart      │         │  Quest engine                │
│  Checkout · Spin · Dashboard│         │  Reward / coupon service     │
│  Rewards                    │         │  Catalog + orders            │
└─────────────────────────────┘         └──────────────┬───────────────┘
                                                       │
                                                       ▼
                                            ┌──────────────────────┐
                                            │  PostgreSQL          │
                                            │  Railway             │
                                            └──────────────────────┘
```

**Principles**

- Built for **end users only**—shop, quest, spin, coupons, progress.
- Single mock user (no real auth); identify via fixed `user_id` or simple name.
- Catalog and reward templates are seeded; no Blinkit production APIs.
- Quest logic lives on the **backend** so rules stay consistent; the UI animates outcomes.
- Mobile-first Blinkit UI language throughout; features feel native, not bolted-on.

---

## Shared stack

| Layer | Choice |
| --- | --- |
| Frontend | Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion |
| Backend | FastAPI, SQLAlchemy, Pydantic |
| DB | PostgreSQL |
| Hosting | Frontend → Vercel · Backend + DB → Railway |

---

## Domain model (target)

```
User ──< Order >── Category
  │                    │
  │                    └── Product
  │
  ├── UserProgress (per calendar month)
  │      explored_categories[]
  │      starter_spin_used
  │      spins_earned / spins_remaining
  │
  └── Coupon / RewardInstance
         template → discount, category, expiry (created_at + 30d)
```

**Quest evaluation (checkout)**

```
order received
    │
    ├─ first order this month? ──► unlock Starter Spin
    │
    ├─ category ∉ explored this month?
    │       and spins_earned < 3? ──► unlock Spin
    │
    └─ else ──► spinUnlocked: false
```

---

## Phase 0 — Project foundation

**Goal:** Runnable empty shells and contracts so later phases plug into known shapes.

### Frontend

- Next.js app with App Router, Tailwind, shadcn/ui scaffold
- Theme tokens: white bg, primary `#0C831F`, Inter, Blinkit-like spacing/radius
- Shared layout shell: top search, bottom nav placeholders
- Env: `NEXT_PUBLIC_API_URL`

### Backend

- FastAPI app with health check `GET /health`
- SQLAlchemy models + Alembic (or create-on-startup for MVP)
- CORS for Vercel / local origins
- Seed script stub

### Deliverable

- Deployable “Hello” front + API + empty Postgres on Railway

---

## Phase 1 — Catalog & mock shopping

**Goal:** Believable Blinkit-like browse → cart → checkout **without** quest logic.

### Data

- Seed ≥12 categories and ≥5 products each
- Products: `id`, `category_id`, `name`, `price` (+ optional image URL)

### APIs

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/categories` | List categories |
| `GET` | `/products` | Optional `?category_id=` filter |

### Frontend pages

- **Home** — category icons / grids (Blinkit-style)
- **Product listing** — per category
- **Cart** — client-side cart (local state / context); line items with category
- **Checkout success** — static “order placed” (quest hooks added in Phase 2)

### Architecture notes

- Cart stays **client-side** for MVP speed; checkout POSTs the purchased category (and user) to the API once Phase 2 lands.
- Product cards: large tiles, soft shadows, 12–16px radius—match Blinkit, don’t invent a new visual language.

### Deliverable

- User can browse Snacks → add items → reach checkout success

---

## Phase 2 — Orders & Category Quest engine

**Goal:** Persist orders and apply business rules 1–5.

### Data

| Table | Role |
| --- | --- |
| `users` | Mock user(s) |
| `orders` | `user_id`, `category`, `created_at` |
| `user_progress` | Per `(user_id, month)`: starter flag, explored set, spin counters |

### Core API

**`POST /checkout`**

Request (conceptual):

```json
{
  "user_id": "...",
  "category": "Snacks"
}
```

Server responsibilities:

1. Insert order  
2. Load or create `UserProgress` for current month  
3. Evaluate rules → update explored categories & spin counts  
4. Return:

```json
{
  "spinUnlocked": true,
  "message": "...",
  "rewardEligible": true
}
```

**`GET /progress`**

- Explored categories, spins earned/remaining, milestone flags (starter, new cat #1, #2)

### Frontend

- Wire Checkout Success to `POST /checkout`
- Branch UI:
  - First purchase → “Welcome to Category Quest / Starter Spin”
  - New category → “New Category Unlocked”
  - Same category → “No new spin earned”
- Home **Category Quest card** bound to `GET /progress`

### Deliverable

- Snacks checkout unlocks Starter Spin; second Snacks order does not; Pharmacy unlocks spin #2

---

## Phase 3 — Spin wheel & rewards

**Goal:** Consuming a spin yields a persisted coupon with 30-day expiry.

### Data

| Table | Role |
| --- | --- |
| `reward_templates` | ~20 static templates (name, discount, category or special type) |
| `coupons` (user rewards) | Instance: user, template snapshot, `expiry_date`, status |

### APIs

| Method | Path | Behavior |
| --- | --- | --- |
| `POST` | `/spin` | Require `spins_remaining > 0` (or pending unlock); pick random template; create coupon; decrement remaining / mark spin used; return reward |
| `GET` | `/coupons` | Active (non-expired) coupons for user |

### Frontend

- **Spin Wheel** page/modal: Framer Motion rotation ~3–4s; land on selected segment (client animates; server is source of truth for reward)
- Confetti + coupon reveal
- **Rewards** page: list coupons, expiry countdown, Redeem (mock)
- Persist “pending spin” from checkout so refresh doesn’t lose the CTA

### Architecture notes

- **Server chooses the reward**; UI mirrors the result to avoid desync.
- Optional: return `reward_id` + display payload; map segments on the wheel to the same template set for visual consistency.

### Deliverable

- Full path: unlock → Spin Now → win Pharmacy coupon → appears under My Coupons

---

## Phase 4 — Quest Dashboard & polish

**Goal:** Dedicated progress surface and Blinkit-grade UX polish.

### Frontend

- **Quest Dashboard**
  - Month title (e.g. July Category Quest)
  - Milestone checklist + star/spin meter
  - Categories explored vs remaining
  - Embedded / linked coupon list
- Progress animations on milestone complete
- Home card ↔ Dashboard deep link (`View Progress`)

### Softening edges

- Loading / empty / error states for API calls
- Mobile layout verification; bottom nav for Home / Quest / Rewards / Cart
- Ensure celebration and wheel never feel like a separate “game app”

### Deliverable

- Dashboard reflects user progress after 1–3 new-category purchases

---

## Phase 5 — Deploy & optional polish

**Goal:** Hosted user MVP plus optional UX extras. No admin or metrics surfaces.

### One hosting (not per-phase)

Deploy **only** root `frontend/` → Vercel and `backend/` → Railway. Phase snapshot folders are never deployed.

### Nice-to-haves (priority order if time)

1. Spin sound effects  
2. Animated coupon cards  
3. Achievement badges  
4. Dark mode  

### Deployment

| Service | Target |
| --- | --- |
| Next.js | Vercel (env → Railway API URL) |
| FastAPI | Railway |
| PostgreSQL | Railway (migrations + seed on deploy or one-shot job) |

### Acceptance = core user flow

1. Home → browse → Snacks checkout → Starter Spin → spin → Pharmacy coupon  
2. Home progress updates  
3. Pharmacy purchase → second spin  
4. Dashboard: Starter ✅ · Cat 1 ✅ · Cat 2 ⬜  
5. Kitchen Essentials → third spin → Quest complete  

---

## Cross-cutting concerns

| Concern | Approach |
| --- | --- |
| Month boundaries | Progress keyed by `YYYY-MM`; first order after rollover resets quest |
| Idempotency | Checkout creates one order per submit; spin endpoint rejects if no spin available |
| Time / expiry | Coupons: `created_at + 30 days`; filter expired on `GET /coupons` |
| Security | MVP: open CORS + mock user; no secrets in client beyond public API URL |
| Testing | Walk the core user flow; optional API tests for rule matrix (first / new / repeat / cap) |
| Scope | No admin UI, analytics dashboards, or stakeholder-only pages |

---

## Suggested build order (summary)

| Phase | Focus | Unlocks |
| --- | --- | --- |
| **0** | Scaffold + deploy plumbing | Foundation |
| **1** | Catalog + cart + checkout shell | Shopping |
| **2** | Orders + quest rules + progress API/UI | Motivation loop |
| **3** | Spin + coupons | Reward payoff |
| **4** | Dashboard + UX polish | Progress clarity |
| **5** | Hosting + optional extras | Shippable user MVP |

Phases 2 and 3 are the product core; 1 is the stage they sit on; 4–5 make the user experience complete and deployable.
