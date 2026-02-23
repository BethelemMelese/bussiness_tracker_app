# Tracker

A Business Dashboard for tracking your entrepreneurial journey. Monitor capital, study progress, market research, financial modeling, and discipline scores in one place.

## Features

- **Capital Tracker** – Track savings, monthly income, and targets (in birr)
- **Study Tracker** – Monitor learning and study progress
- **Market Research** – Organize and track market research
- **Financial Model** – Manage financial modeling data
- **Discipline Score** – Track consistency and discipline

Additional features:

- User authentication (login/register)
- JWT-based sessions
- Dark/light theme toggle
- Responsive dashboard layout

## Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS, Radix UI, shadcn-style components
- **Backend:** Express.js, Node.js
- **Database:** MongoDB with Mongoose

## Prerequisites

- Node.js 18+
- MongoDB (local or remote)
- npm

## Setup

### 1. Install dependencies

```bash
# Root (Next.js frontend)
npm install

# Server (Express API)
cd server && npm install
```

### 2. Configure environment

Create `server/.env`:

```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/tracker
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### 3. Run MongoDB

Ensure MongoDB is running on `localhost:27017` or update `MONGODB_URI` to your instance.

## Development

Open two terminals:

**Terminal 1 – Next.js (port 3000):**

```bash
npm run dev
```

**Terminal 2 – API server (port 4000):**

```bash
npm run dev:server
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command        | Description                    |
|----------------|--------------------------------|
| `npm run dev`  | Start Next.js dev server       |
| `npm run dev:server` | Start Express API with watch |
| `npm run build`| Build Next.js for production   |
| `npm run start`| Start Next.js in production    |
| `npm run lint` | Run ESLint                     |

## Project Structure

```
Tracker/
├── app/                    # Next.js app router pages
├── components/             # React components
│   ├── dashboard/          # Dashboard widgets
│   └── ui/                 # Shared UI components
├── lib/                    # Auth, API client, utilities
├── server/                 # Express API
│   ├── routes/             # API routes (auth, capital, study, etc.)
│   ├── config/             # DB connection
│   └── index.js
└── package.json
```

## API Endpoints

- `GET /api/health` – Health check
- `/api/auth` – Login, register, logout
- `/api/capital` – Capital/savings data
- `/api/study` – Study tracker data
- `/api/market` – Market research data
- `/api/financial` – Financial model data
- `/api/discipline` – Discipline score data
