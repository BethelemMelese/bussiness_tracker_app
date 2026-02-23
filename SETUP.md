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

**Frontend** (optional - `.env.local`):

```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

Defaults to `http://localhost:4000/api` if not set.

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
