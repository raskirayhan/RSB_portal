# 🚀 RSB_portal Deployment Guide (Vercel & Netlify)

A complete step-by-step guide to deploying **Rayhan Special Batch (RSB_portal)** to **Vercel** and **Netlify** with a cloud PostgreSQL database (Neon / Supabase).

---

## 1. Cloud PostgreSQL Setup (Free on Neon.tech)

1. Go to [https://neon.tech](https://neon.tech) and create an account.
2. Click **Create Project** -> Name: `rsb-portal-db`.
3. Select Region: **Singapore (ap-southeast-1)** for lowest latency from Bangladesh.
4. Copy your **Pooled / Direct Connection String**:
   ```text
   postgresql://neondb_owner:npg_xxxx@ep-xxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
5. Push the schema and seed your online database from your terminal:
   ```bash
   cd server
   $env:DATABASE_URL="your_neon_connection_string"
   npx prisma db push
   npm run seed
   ```

---

## 2. Backend Deployment on Vercel

1. Log in to [https://vercel.com](https://vercel.com).
2. Click **Add New** -> **Project** -> Select `raskirayhan/RSB_portal`.
3. Configure settings:
   - **Root Directory**: `server`
   - **Framework Preset**: `Other`
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: Leave empty
4. Add Environment Variables:

| Variable | Example Value | Purpose |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://...@neon.tech/neondb?sslmode=require` | Neon PostgreSQL Connection |
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `5000` | Port |
| `JWT_SECRET` | `super_secret_jwt_key_rsb_2026_xyz` | JWT Signing Secret |
| `JWT_EXPIRES_IN` | `7d` | Token Validity |
| `REFRESH_TOKEN_SECRET`| `super_secret_refresh_token_rsb_2026` | Refresh Token Secret |
| `CLIENT_URL` | `https://your-frontend.vercel.app` | Frontend Origin |
| `MAX_ALLOWED_DEVICES` | `2` | Dual-Device Session Limit |

5. Click **Deploy**. Your backend API will be live at `https://your-backend.vercel.app`.

---

## 3. Frontend Deployment (Vercel or Netlify)

### Option A: Deploy on Vercel
1. On Vercel, click **Add New** -> **Project** -> Select `raskirayhan/RSB_portal`.
2. Configure settings:
   - **Root Directory**: `client`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variable:
   - `VITE_API_URL`: `https://your-backend.vercel.app/api`
4. Click **Deploy**.

### Option B: Deploy on Netlify
1. Log in to [https://app.netlify.com](https://app.netlify.com).
2. Click **Add new site** -> **Import an existing project** -> GitHub -> `raskirayhan/RSB_portal`.
3. Configure settings:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist`
4. Under **Environment variables**:
   - `VITE_API_URL`: `https://your-backend.vercel.app/api`
5. Click **Deploy site**.
   *(Note: The provided `_redirects` and `netlify.toml` automatically handle Single Page App routing).*

---

## 4. Default Seeded Credentials for Testing

* **Super Admin (Rayhan Sir)**: `rayhan@rsb.com` | `Password123!`
* **Student 1 (Full Profile & Fee Paid)**: `student@rsb.com` | `Password123!`
* **Student 2 (Incomplete & Fee Unpaid)**: `sakib@rsb.com` | `Password123!`
