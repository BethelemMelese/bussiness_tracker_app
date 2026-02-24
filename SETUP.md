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

## Deploying to Vercel (one project: frontend + API)

The app is set up so **one Vercel deployment** serves both the Next.js frontend and the Express API. The API runs as a serverless function at `/api/*` (e.g. `/api/auth/login`).

### 1. Deploy

Connect the repo to Vercel and deploy as usual (no custom build; default Next.js build is used).

### 2. Environment variables (Vercel project → Settings → Environment Variables)

Set these for **Production** (and Preview if you use it):

| Variable | Example | Required |
|----------|---------|---------|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/tracker` | Yes |
| `JWT_SECRET` | A long random string | Yes |
| `CORS_ORIGIN` | `https://your-app.vercel.app` | Yes (your frontend URL) |

Set `NEXT_PUBLIC_API_URL` to your deployment URL + `/api` (e.g. `https://your-app.vercel.app/api`) so the frontend uses the same-domain API. If you leave it unset, the app would default to `http://localhost:4000/api`, which would fail in production.

### 3. Local dev

- **API:** `npm run dev:server` (Express on port 4000).
- **Frontend:** `npm run dev` (Next.js on port 3000).
- Use `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:4000/api` so the frontend talks to the local API.
