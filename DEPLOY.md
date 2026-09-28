# Deploy — Category Quest MVP

One frontend (Vercel/Netlify) + one backend (Railway or Netlify Functions). Do **not** deploy `phase-*/` folders.

> **Note:** For deploying the backend to Netlify using Serverless Functions, see [DEPLOY_NETLIFY.md](file:///d:/blinkitmvp/DEPLOY_NETLIFY.md).

**GitHub repo:** https://github.com/vrittikht/blinkitmvp

---

## A. Backend → Railway (do this first)

1. Go to [railway.app](https://railway.app) → **Login with GitHub**.
2. **New Project** → **Deploy from GitHub repo** → select `vrittikht/blinkitmvp`.
3. After the service is created, open it → **Settings**:
   - **Root Directory** = `backend`
   - Start command is already in `backend/railway.toml` (`uvicorn … --port $PORT`)
4. **Add PostgreSQL**: in the project → **+ New** → **Database** → **PostgreSQL**.  
   Railway usually injects `DATABASE_URL` automatically into your API service — if not, link the DB to the API service under **Variables**.
5. In the **API service → Variables**, set:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | From Postgres (auto if linked) |
| `CORS_ORIGINS` | `http://localhost:3000` for now (update after Vercel) |
| `SEED_ON_STARTUP` | `true` |

6. **Generate domain**: Settings → Networking → **Generate Domain**.  
   Copy it, e.g. `https://blinkitmvp-production-xxxx.up.railway.app`
7. Test: open `https://YOUR-RAILWAY-HOST/health`  
   You should see `"phase": 5`, `"status": "ok"`.

Optional re-seed: `POST https://YOUR-RAILWAY-HOST/admin/seed`

---

## B. Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **Login with GitHub**.
2. **Add New Project** → import `vrittikht/blinkitmvp`.
3. Configure:
   - **Framework Preset:** Next.js  
   - **Root Directory:** `frontend` (click Edit → select `frontend`)
4. **Environment Variables**:

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Your Railway URL **with no trailing slash** (e.g. `https://blinkitmvp-production-xxxx.up.railway.app`) |

5. Click **Deploy**. Wait for the build to finish.
6. Copy your Vercel URL, e.g. `https://blinkitmvp.vercel.app`

---

## C. Connect CORS (required)

1. Back in **Railway → API → Variables**, set:

```text
CORS_ORIGINS=https://YOUR-VERCEL-APP.vercel.app
```

(You can keep localhost too: `https://YOUR-VERCEL-APP.vercel.app,http://localhost:3000`)

2. Redeploy / wait for Railway to restart.
3. Open the Vercel URL and test: Home → add to cart → Place Order → Spin → Account coupons.

---

## D. Acceptance checklist

1. Home → category → cart → Place Order → tracking + spin popup  
2. Spin → coupon under Account / My coupons  
3. Second category order → another spin  
4. Quest progress updates in Account  

---

## Quick reference

| Piece | Where | Root dir | Key env |
| --- | --- | --- | --- |
| API | Railway + Postgres | `backend` | `DATABASE_URL`, `CORS_ORIGINS`, `SEED_ON_STARTUP=true` |
| App | Vercel | `frontend` | `NEXT_PUBLIC_API_URL` = Railway URL |
