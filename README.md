# Category Quest MVP

User-facing Blinkit **Category Quest** prototype — shippable Phase 5.

Specs: [problemstatement.md](./problemstatement.md) · [architecture.md](./architecture.md) · [DEPLOY.md](./DEPLOY.md)

## One app, one host

| Layer | Path | Host |
| --- | --- | --- |
| Frontend | [`frontend/`](./frontend/) | **Vercel** |
| Backend + DB | [`backend/`](./backend/) | **Railway** + Postgres |

`phase-*/` = local snapshots only (not deployed).

## Local development

```bash
cd backend
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

cd frontend
npm install
npm run dev
```

## Tests

```bash
# API smoke (phases 0–3 APIs)
$env:API_BASE='http://127.0.0.1:8000'
.\backend\.venv\Scripts\python .\scripts\test_phases.py

# Core acceptance journey
.\backend\.venv\Scripts\python .\scripts\acceptance_flow.py
```

## Phase 5 extras

- Spin sound effects (Web Audio)
- Animated coupon cards
- Achievement badges on Quest
- Dark mode toggle (header)
- Seed-on-startup + Postgres URL normalization for Railway

## Phase status

| Phase | Status |
| --- | --- |
| 0–4 Product | Done in root app |
| 5 Deploy + polish | Done |
