# JeevanSetu — Production Deployment Guide

## 1. Deployment Architecture Overview
JeevanSetu is designed to operate seamlessly in both resource-constrained local environments and high-availability cloud infrastructure:

| Component | Local / Hackathon Evaluation | Enterprise Production |
|---|---|---|
| **Database** | Embedded SQLite (`prisma/dev.db`) | PostgreSQL 16 (Managed AWS RDS / Cloud SQL) |
| **Web Server** | Next.js 15 Standalone (`node server.js`) | Docker Container on AWS ECS / Google Cloud Run / K8s |
| **AI Microservice** | Integrated deterministic rules | Containerized Python FastAPI (`apps/ai-service`) |
| **File Storage** | Local filesystem (`public/uploads`) | S3-compatible Object Storage (MinIO, AWS S3, GCS) |
| **Interoperability** | Mock ABDM Gateway (`MockAbdmProvider`) | Official National Health Authority (NHA) ABDM Bridge |

---

## 2. Docker Compose Deployment (Recommended for Cloud / Staging)

The repository provides a production-grade multi-container manifest in `infrastructure/docker/docker-compose.yml`.

### Step 1: Configure Environment Variables
Create a `.env.production` file based on `.env.example`:
```bash
# Database
POSTGRES_USER=jeevansetu
POSTGRES_PASSWORD=your_production_secure_password_here
POSTGRES_DB=jeevansetu_db

# Security & Tokens
JWT_SECRET=generate_a_random_64_character_hex_string_here
QR_SIGNING_KEY=generate_another_random_64_character_hex_key_here

# Networking
AI_SERVICE_URL=http://ai-service:8001
NEXT_PUBLIC_APP_NAME=JeevanSetu
```

### Step 2: Build and Launch Containers
```bash
# Start PostgreSQL, Next.js Web App, and Python AI Microservice
docker compose -f infrastructure/docker/docker-compose.yml up -d --build
```

### Step 3: Run Database Migrations & Seeds
```bash
# Apply schema migrations to PostgreSQL
docker compose -f infrastructure/docker/docker-compose.yml exec web npx prisma db push

# Seed district reference facilities and medicines
docker compose -f infrastructure/docker/docker-compose.yml exec web node scripts/seed.mjs
```

---

## 3. Local Evaluation Quickstart (Without Docker)

For immediate evaluation on any machine with Node.js 18+:
```powershell
# 1. Install dependencies
npm install

# 2. Push database schema
npx prisma db push

# 3. Seed Maharashtra Demo District data
node scripts/seed.mjs

# 4. Start local server
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## 4. Health Checks & Monitoring
- **Web Application Liveness Probe**: `GET http://localhost:3000/api/admin/metrics` (requires authenticated header) or `GET http://localhost:3000`
- **AI Microservice Health Probe**: `GET http://localhost:8001/health` -> returns `{"status": "ok", "version": "1.0.0"}`
- **Database Connection Check**: Handled automatically in Docker Compose healthcheck (`pg_isready`).

---

## 5. Security Hardening Checklist
- [x] Rotate all default JWT and HMAC signing keys.
- [x] Configure SSL/TLS termination via Nginx or Cloudflare Reverse Proxy.
- [x] Set secure cookie flags (`SameSite=Strict`, `Secure=true`, `HttpOnly=true`).
- [x] Apply database connection pooling (`pgbouncer` or Prisma Client connection limit).
- [x] Restrict database port 5432 to internal Docker bridge network.
