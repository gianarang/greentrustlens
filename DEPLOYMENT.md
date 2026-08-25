# GreenTrustLens — Deployment Guide

Two deployables:

| Part | Location | Platform | How |
|------|----------|----------|-----|
| Backend API | `backend/` | **Northflank** | Docker image (`backend/Dockerfile`) |
| Frontend | `frontend_/` | **Vercel** | Next.js project |

Deploy the **backend first** so you have its public URL to give the frontend.

---

## 1. Backend → Northflank

The backend is an Express + Prisma (PostgreSQL) + Groq service. It ships a
production `Dockerfile` and a `/ok` health endpoint.

### 1.1 Provision a database
Create a PostgreSQL addon (Northflank's managed Postgres, or any external one).
Copy its connection string — you'll use it as `DATABASE_URL`.

### 1.2 Create the service
- **New Service → Deployment → Build from a Dockerfile**
- Repo / build context: the `backend/` directory
- Dockerfile path: `backend/Dockerfile`
- Exposed port: **3000** (Northflank injects `PORT`; the app binds `0.0.0.0`)
- Health check: HTTP `GET /ok`

### 1.3 Environment variables
Set these on the service (see `backend/.env.example` for the full list):

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | ✅ | Postgres URL, e.g. `postgresql://…?sslmode=require` |
| `GROQ_API_KEY` | ✅ | From https://console.groq.com |
| `GROQ_MODEL` | – | Defaults to `openai/gpt-oss-120b`. Must be a model your Groq account can access — check https://console.groq.com/docs/models |
| `CORS_ORIGIN` | – | Set to your Vercel URL, e.g. `https://greentrustlens.vercel.app`. Comma-separate multiple origins. Defaults to `*` |
| `NODE_ENV` | – | `production` |
| `UPLOAD_DIR` | – | `/app/uploads` (see volume below) |
| `MAX_UPLOAD_MB` | – | Defaults to `20` |

> Do **not** set `PORT` manually — Northflank provides it.

### 1.4 Run migrations
Prisma migrations ship inside the image. Configure a **pre-deploy / release
command** on the service:

```bash
npm run migrate:deploy
```

(`prisma` and `dotenv` are runtime dependencies, so this works in the prod image.)

### 1.5 Persist uploads (optional but recommended)
Uploaded files are written to `UPLOAD_DIR` (`/app/uploads`), which the Dockerfile
declares as a `VOLUME`. Mount a Northflank **volume** at `/app/uploads`, otherwise
uploaded documents are lost on every redeploy.

### 1.6 Verify
After deploy, `GET https://<your-backend>.northflank.app/ok` should return
`{"msg":"server is up and healthy"}`.

---

## 2. Frontend → Vercel

Next.js 16 app. It talks to the backend exclusively through
`NEXT_PUBLIC_API_URL`.

### 2.1 Import the project
- **Add New → Project**, import the repo
- **Root Directory: `frontend_`**
- Framework preset: **Next.js** (auto-detected)
- Package manager: **pnpm** (a `pnpm-lock.yaml` is present)
- Build command: `pnpm build` (default) — Install: `pnpm install` (default)

### 2.2 Environment variable
Add under **Settings → Environment Variables** (Production, Preview, Development):

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://<your-backend>.northflank.app` (no trailing slash) |

> This is a build-time public variable. If you change it, **redeploy** so the new
> value is baked into the client bundle.

### 2.3 Close the CORS loop
Once you know the Vercel URL, set the backend's `CORS_ORIGIN` to it and redeploy
the backend.

---

## 3. Local development

```bash
# Backend (terminal 1)
cd backend
cp .env.example .env         # fill in DATABASE_URL and GROQ_API_KEY
npm install
npm run migrate:deploy       # or: npm run migrate:dev
npm run dev                  # http://localhost:3000

# Frontend (terminal 2)
cd frontend_
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:3000
pnpm install
pnpm dev                     # http://localhost:3000 (Next picks the next free port if taken)
```

---

## 4. API surface (backend)

| Method | Path | Purpose |
|--------|------|---------|
| GET  | `/ok` | Health check |
| POST | `/signin` | Combined sign-in / sign-up (`{ name?, email, password }`) |
| POST | `/analyze-company` | Analyze by company name (`{ companyName, userId? }`) |
| POST | `/analyze-url` | Scrape + analyze a URL (`{ url, companyName?, userId? }`) |
| POST | `/upload-document` | Analyze an uploaded file (multipart: `documents`, `companyName`, `userId?`) |
| GET  | `/analyses` | List recent analyses (`?userId=`) |
| GET  | `/analysis/:id` | Full analysis by id |
