# 🚀 Free Hosting Guide: JobGuard AI

This guide will help you deploy your full-stack project for free using the best cloud providers.

## 1. Database: Supabase (PostgreSQL)
1. Go to [Supabase](https://supabase.com/) and create a free account.
2. Create a new project named `JobGuard`.
3. Go to **Project Settings** -> **Database**.
4. Copy the **Connection String** (URI). It should look like:
   `postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres`
5. Replace `[YOUR-PASSWORD]` with your actual password.

## 2. Backend: Render (FastAPI)
1. Go to [Render](https://render.com/) and sign up with GitHub.
2. Click **New** -> **Web Service**.
3. Select your `JobGuard-AI` repository.
4. Use these settings:
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:$PORT`
5. Go to **Environment Variables** and add:
   - `DATABASE_URL`: (The string you copied from Supabase)
   - `BACKEND_CORS_ORIGINS`: `*` (or your Vercel URL later)
6. Click **Deploy**. Copy your new Render URL (e.g., `https://jobguard-backend.onrender.com`).

## 3. Frontend: Vercel (Next.js)
1. Go to [Vercel](https://vercel.com/) and sign up with GitHub.
2. Click **Add New** -> **Project**.
3. Import your `JobGuard-AI` repository.
4. **Important**: In the configuration:
   - **Root Directory**: `frontend`
5. Go to **Environment Variables** and add:
   - `NEXT_PUBLIC_API_URL`: `https://your-render-url.onrender.com/api/v1`
6. Click **Deploy**.

---
### 🎉 Your project is now live!
Your Frontend URL will be something like `https://jobguard-ai.vercel.app`. You can share this with anyone!
