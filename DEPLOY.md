# Deploy — Category Quest MVP (Phase 5)

One frontend + one backend. Do **not** deploy `phase-*/` folders.

## 1. Backend → Railway

1. Create a Railway project.
2. Add a **PostgreSQL** plugin.
3. Deploy the `backend/` directory (Root Directory = `backend`).
4. Variables:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | From Postgres plugin (auto `postgres://…` is fine) |
| `CORS_ORIGINS` | Your Vercel URL, e.g. `https://your-app.vercel.app` |
| `SEED_ON_STARTUP` | `true` |

5. Start command (already in `railway.toml`):

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

6. Confirm `GET https://<railway-host>/health` → `"phase": 5`.

Optional re-seed: `POST /admin/seed`

## 2. Frontend → Vercel

1. Import the GitHub repo.
2. **Root Directory** = `frontend`
3. Environment variable:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Railway public URL (no trailing slash) |

4. Deploy. Open the Vercel URL and walk the acceptance flow.

## 3. Acceptance checklist

1. Home → Snacks → checkout → Starter Spin  
2. Spin → coupon appears under Rewards  
3. Pharmacy order → second spin  
4. Quest dashboard milestones update  
5. Kitchen Essentials → progress toward quest complete  

Automated:

```bash
$env:API_BASE='https://your-railway-host'
python scripts/acceptance_flow.py
```
