# API Tester (Postman-lite)

Production-ready "Postman-lite" web app with:

- React (Vite) frontend
- Node.js (Express) backend
- PostgreSQL database
- Prisma ORM
- Dockerized, deployable on Coolify (services can run independently)

## Services / Ports

- **frontend**: `80` (nginx)
- **backend**: `8080` (Express)
- **postgres**: `5432`

## Quickstart (Docker Compose)

```bash
cp .env.example .env
docker-compose up --build
```

Then open:

- Frontend: `http://localhost`
- Backend health: `http://localhost:8080/health`

## Local Development (optional)

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Environment Variables

### Backend

- **`DATABASE_URL`**: PostgreSQL connection string
- **`JWT_SECRET`**: JWT signing secret
- **`CORS_ORIGIN`**: allowed browser origin (e.g. `http://localhost`)

### Frontend

- **`VITE_API_URL`**: backend base URL (e.g. `http://localhost:8080`)

## Database / Prisma

- Prisma schema: `backend/prisma/schema.prisma`
- Migrations: `backend/prisma/migrations/`

In Docker, the backend container runs:

- `npx prisma migrate deploy`
- `npx prisma generate`

## API Endpoints

### Auth

- `POST /auth/register`
- `POST /auth/login`

### Requests

- `POST /requests/send`
- `GET /requests`
- `GET /requests/:id`

### Collections

- `POST /collections`
- `GET /collections`
- `DELETE /collections/:id`

### Environments

- `POST /env` (upsert key/value)
- `GET /env`

## Coolify Notes

- Deploy **each service independently** using the `frontend/Dockerfile` and `backend/Dockerfile`, plus a managed Postgres (or use the compose `postgres` service).
- Do **not** hardcode secrets; configure `DATABASE_URL`, `JWT_SECRET`, and frontend `VITE_API_URL` in Coolify environment variables.

# postman-lite
