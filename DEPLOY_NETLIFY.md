# Deploying Backend to Netlify — Category Quest MVP

This guide explains how to deploy the FastAPI backend (`backend/` folder) to **Netlify** using Netlify Serverless Functions (`mangum`).

---

## Prerequisites & Architecture

1. **Frontend:** Deployed on Vercel or Netlify.
2. **Backend:** FastAPI running as a Netlify Serverless Function via `backend/functions/api.py`.
3. **Database:** Postgres (e.g. Neon, Supabase, Railway Postgres) via `DATABASE_URL` environment variable. (If no external database is provided, SQLite fallback is enabled via `/tmp`).

---

## Step-by-Step Instructions

### Step 1: Push Changes to GitHub
Make sure the new files (`backend/netlify.toml`, `backend/functions/api.py`, updated `requirements.txt`) are committed and pushed to your GitHub repository (`vrittikht/blinkitmvp`).

---

### Step 2: Create a New Site on Netlify

1. Log in to [Netlify](https://app.netlify.com).
2. Click **Add new site** → **Import an existing project**.
3. Select **GitHub** and authorize Netlify.
4. Select your repository: `vrittikht/blinkitmvp`.

---

### Step 3: Configure Build & Environment Settings

In the Netlify Site Settings screen:

- **Base Directory:** `backend`
- **Build Command:** (Leave empty, or enter `pip install -r requirements.txt`)
- **Publish Directory:** (Leave empty)
- **Functions Directory:** `functions`

#### Environment Variables (under Site Settings → Environment Variables):

Add the following environment variables:

| Variable | Value | Description |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql://...` | Connection string to your PostgreSQL instance (e.g. Neon, Supabase, Railway Postgres) |
| `CORS_ORIGINS` | `https://your-frontend-app.vercel.app` | Comma-separated list of allowed origins (e.g. Vercel URL, Netlify URL, `http://localhost:3000`) |
| `SEED_ON_STARTUP` | `true` | Seed catalog/rewards on startup |

---

### Step 4: Deploy & Test Backend

1. Click **Deploy site**. Netlify will install `requirements.txt` and package the serverless function.
2. Once deployed, Netlify will give you a domain, e.g., `https://blinkit-backend-xxxx.netlify.app`.
3. Test your health endpoint in browser:
   `https://blinkit-backend-xxxx.netlify.app/health`
   - Expected JSON response: `{"status":"ok","service":"category-quest-api","phase":5,"version":"1.0.0"}`

---

### Step 5: Update Frontend API URL

1. Go to your frontend project (e.g., in **Vercel** or **Netlify**).
2. Update the environment variable:
   ```text
   NEXT_PUBLIC_API_URL=https://blinkit-backend-xxxx.netlify.app
   ```
3. Trigger a redeploy of the frontend site so it points to your new Netlify backend!

---

## Verification Checklist

- [ ] `GET /health` returns `200 OK`.
- [ ] `GET /categories` returns 12 categories.
- [ ] `POST /checkout` works from the live frontend.
- [ ] Spin wheel and coupons operate smoothly.
