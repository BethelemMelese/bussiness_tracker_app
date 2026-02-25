# Tracker - Setup Guide

## Prerequisites

- Node.js 18+
- MongoDB running locally (`mongodb://localhost:27017`)

## Quick Start

### 1. Install dependencies

```bash
# Root (Next.js frontend)
npm install

# Server (Express API)
cd server && npm install
```

### 2. Configure environment

**Server** (`server/.env`):

```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/tracker
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

**Frontend** (optional - `.env.local` for local dev):

```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

Defaults to `http://localhost:4000/api` if not set. On Vercel, if the API is on the same domain, you don’t need to set this (same-origin `/api` is used).

### 3. Run the app

Use **two terminals**:

**Terminal 1 – API server**

```bash
npm run dev:server
```

Starts the Express API on `http://localhost:4000`.

**Terminal 2 – Next.js frontend**

```bash
npm run dev
```

Starts the Next.js app on `http://localhost:3000`.

### 4. Use the app

1. Open `http://localhost:3000`
2. Click **Register** to create an account
3. Log in and use the dashboard

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user (auth required) |
| GET/PUT/POST | `/api/capital/*` | Capital tracker |
| GET/POST/DELETE | `/api/study/*` | Study tracker |
| GET/POST/DELETE | `/api/market/*` | Market research |
| GET/PUT | `/api/financial/*` | Financial model |
| GET/POST/PUT/DELETE | `/api/discipline/*` | 21-day habits |

All data routes require a valid JWT in the `Authorization: Bearer <token>` header.

## Deploying backend on Vercel (separate project) — recommended

You can deploy the **Express API as its own Vercel project**. Same repo, two projects: one for the Next.js frontend, one for the API.

### 1. Backend project on Vercel

1. In [Vercel Dashboard](https://vercel.com/dashboard), click **Add New…** → **Project**.
2. Import the **same Git repo** as your frontend.
3. **Root Directory:** click **Edit**, choose **server** (the `server` folder only).
4. **Framework Preset:** choose **Other** (Vercel will run the Express app as a serverless function).
5. **Build Command:** leave empty (or remove any default).
6. **Output Directory:** leave empty.
7. Deploy.

After deploy, you’ll get a URL like `https://tracker-api-xxx.vercel.app`. The API base for the frontend is that URL + `/api`, e.g. `https://tracker-api-xxx.vercel.app/api`.

### 2. Backend environment variables

In the **backend** Vercel project → **Settings** → **Environment Variables**, add for **Production**:

| Variable | Example |
|----------|---------|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/tracker` |
| `JWT_SECRET` | A long random string |
| `CORS_ORIGIN` | `https://bussiness-tracker-app.vercel.app` (no trailing slash; optional — any `*.vercel.app` is allowed) |

Redeploy the backend after adding env vars.

### 3. Point the frontend to the backend

In the **frontend** Vercel project → **Settings** → **Environment Variables**, add:

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | `https://tracker-api-xxx.vercel.app/api` (your backend URL + `/api`) |

Redeploy the frontend so the new API URL is used.

### 4. Local dev

- **API:** `npm run dev:server` (Express on port 4000).
- **Frontend:** `npm run dev` (Next.js on port 3000).
- Use `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:4000/api` so the frontend talks to the local API.

---

## Deploying to Vercel (one project: frontend + API)

Alternatively, **one Vercel deployment** can serve both the Next.js app and the Express API via the catch-all route at `app/api/[[...path]]`. Use this if you prefer a single project and URL.

- Set **frontend** env vars: `MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGIN`, and optionally `NEXT_PUBLIC_API_URL` (same origin).
- See the repo for the combined setup; the **recommended** approach is deploying the backend separately (above).
