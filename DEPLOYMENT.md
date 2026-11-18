# 🚀 RSB_portal Deployment Guide (Vercel & Netlify)

A complete step-by-step guide to deploying **Rayhan Special Batch (RSB_portal)** to **Vercel** and **Netlify** with a cloud PostgreSQL database (Neon / Supabase).

---

## 1. Cloud PostgreSQL Setup (Free on Neon.tech)

1. Go to [https://neon.tech](https://neon.tech) and create an account.
2. Click **Create Project** -> Name: `rsb-portal-db`.
3. Select Region: **Singapore (ap-southeast-1)** for lowest latency from Bangladesh.
4. Copy your **Pooled / Direct Connection String**:
   ```text
   postgresql://username:password@ep-sample-project.region.aws.neon.tech/neondb?sslmode=require
   ```
5. Push the schema and seed your online database from your terminal:
   ```bash
   cd server
   $env:DATABASE_URL="postgresql://username:password@ep-sample-project.region.aws.neon.tech/neondb?sslmode=require"
   npx prisma db push
   npm run seed
   ```

---

## 2. Backend Deployment on Vercel

1. Log in to [https://vercel.com](https://vercel.com).
2. Click **Add New** -> **Project** -> Select `raskirayhan/RSB_portal`.
3. Configure settings:
   - **Project Name**: `rsb-portal-server` (or any name you prefer)
   - **Root Directory**: `server` (Click **Edit** -> select `server`)
   - **Framework Preset**: `Other`
   - **Build Command**: `npm run vercel-build` (or leave default)
   - **Output Directory**: Leave empty
4. Add the following **Environment Variables** in Vercel project settings:

| Key | Example / Placeholder Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://username:password@ep-sample-pooler.region.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=rsb` | Your pooled Neon DB connection string |
| `NODE_ENV` | `production` | Production environment |
| `PORT` | `5000` | Port |
| `JWT_SECRET` | `your_super_secret_jwt_key_here` | 256-bit secure secret key |
| `JWT_EXPIRES_IN` | `7d` | Token Validity (e.g. 7d) |
| `REFRESH_TOKEN_SECRET`| `your_ultra_secure_refresh_token_key_here` | 256-bit refresh token secret |
| `CLIENT_URL` | `https://client-xi-lac.vercel.app` | Frontend Origin (Live Vercel URL) |
| `MAX_ALLOWED_DEVICES` | `2` | Dual-Device Session Limit |
| `EMAIL_HOST` | `smtp.gmail.com` | SMTP Host |
| `EMAIL_PORT` | `587` | SMTP Port |
| `EMAIL_USER` | `your_email@example.com` | Notification sender email |
| `EMAIL_PASS` | `your_smtp_app_password_here` | SMTP App Password |

> [!WARNING]
> Never commit real database URLs or passwords to git. Always store production secrets securely in the Vercel Dashboard under **Project Settings > Environment Variables**.

5. Click **Deploy**. Your backend API will be live at `https://<your-backend-project>.vercel.app` (e.g. `https://rsb-portal-server.vercel.app`).
   - Test by opening: `https://<your-backend-project>.vercel.app/health`

---

## 3. Connect Live Frontend with Backend

You already deployed the frontend at **`https://client-xi-lac.vercel.app/`**. Now connect it with your backend:

1. In [https://vercel.com](https://vercel.com), open your frontend project: **`client-xi-lac`**.
2. Go to **Settings** -> **Environment Variables**.
3. Add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://<your-backend-project>.vercel.app/api` *(Your backend Vercel URL + `/api`)*
4. Go to **Deployments** tab -> click the three dots (`...`) on the latest deployment -> **Redeploy**.
5. Once redeployed, open `https://client-xi-lac.vercel.app/login` to log in!

---

## 4. Frontend Deployment (Vercel or Netlify)

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

## 5. Seeded Test Accounts (Development & Testing)

* **Super Admin (Rayhan Sir)**: `rayhan@rsb.com` | `Password123!`
* **Student 1 (Full Profile & Fee Paid)**: `student@rsb.com` | `Password123!`
* **Student 2 (Incomplete & Fee Unpaid)**: `sakib@rsb.com` | `Password123!`
