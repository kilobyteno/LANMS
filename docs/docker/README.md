# Docker

LANMS runs as three containers: Next.js frontend, FastAPI backend, and PostgreSQL. Service images live under [`frontend/Dockerfile`](../../frontend/Dockerfile), [`backend/Dockerfile`](../../backend/Dockerfile), and [`postgres/Dockerfile`](../../postgres/Dockerfile). The root [`docker-compose.yml`](../../docker-compose.yml) is the main full-stack entry for local use and self-hosting.

There is no single all-in-one root image. Staging on Coolify deploys frontend and backend as separate applications (see [Coolify](#coolify)).

## Prerequisites

- [Docker Engine](https://docs.docker.com/engine/install/) with the Compose plugin (`docker compose version`)
- A copy of the repository
- Enough free disk for Node and Python image builds

## Configure environment

From the repository root:

```bash
cp .env.example .env
```

Edit `.env` before the first build:

1. Set `DB_PASSWORD` (and keep `DB_HOST=db` for Compose).
2. Generate an RSA JWT key pair and set `JWT_PUBLIC_KEY` / `JWT_PRIVATE_KEY` (see comments in [`.env.example`](../../.env.example)). Use literal `\n` for PEM newlines; the backend normalises them on load.
3. Set a strong `OTP_SECRET_KEY`.
4. Keep `PORTAL_URL` as the browser URL of the frontend (`http://localhost:8080` for local Compose).
5. Keep `NEXT_PUBLIC_CORE_API_URL` as a **browser-reachable** API base (`http://localhost:8000/v3` for local Compose). Do not use the Docker service hostname `backend` here; the browser cannot resolve it.

`NEXT_PUBLIC_*` values are baked into the frontend image at **build** time. Change them, then rebuild the frontend service.

For local Compose, `ENV=local` is appropriate. For Coolify staging or production, use `staging` or `production` and supply all required backend secrets (JWT keys, `OTP_SECRET_KEY`, `PORTAL_URL`).

Local Compose may use `POSTGRES_HOST_AUTH_METHOD=trust`. On Coolify, staging, or production, set a real database password and do not rely on trust.

## Build and run

From the repository root:

```bash
docker compose up --build
```

Detached mode:

```bash
docker compose up --build -d
```

| Service | Default host URL | Container port |
| --- | --- | --- |
| Frontend | http://localhost:8080 | 8080 |
| Backend API | http://localhost:8000 | 8000 |
| PostgreSQL | localhost:5432 | 5432 |

Healthchecks:

- Backend: `GET /v3/system/up`
- Frontend: root URL on port 8080
- Database: `pg_isready`

Stop and remove containers (keeps the Postgres volume):

```bash
docker compose down
```

## Migrations and first user

Images do not run Alembic on start. After the stack is healthy:

```bash
docker compose exec backend alembic upgrade head
```

Optional bootstrap user (set `INITIAL_USER_EMAIL` and `INITIAL_USER_PASSWORD` in `.env` first):

```bash
docker compose exec backend python create_initial_user.py
```

## Testing with Docker

Use Compose to validate that the stack builds and passes healthchecks. Automated unit and integration tests are not run inside the production backend image (`tests/` is excluded from that image by design).

Run backend tests on the host (see [backend docs](../backend/README.md)):

```bash
cd backend
uv sync --all-groups
uv run pytest
```

CI also runs backend checks against a Postgres service (see `.github/workflows/code-backend.yml`).

## Coolify

### Current staging model (two applications)

GitHub Actions on pushes to `develop` trigger Coolify webhooks for backend and frontend separately (`.github/workflows/staging-backend.yml`, `.github/workflows/staging-frontend.yml`).

Configure two Coolify applications from this repository:

| App | Base directory | Dockerfile | Port | Notes |
| --- | --- | --- | --- | --- |
| Backend | `backend` | `Dockerfile` | 8000 | Health path `/v3/system/up`. Set DB and secret env vars at runtime. |
| Frontend | `frontend` | `Dockerfile` | 8080 | Set build args `NEXT_PUBLIC_ENV` and `NEXT_PUBLIC_CORE_API_URL` to the **public** API URL (for example `https://api.example.com/v3`). |

Use a Coolify-managed PostgreSQL (or external DB) and point the backend at it with `DB_*`. Run migrations as a one-off after deploy (`alembic upgrade head` in the backend container or an equivalent Coolify execute command).

### Compose on Coolify (optional)

You can also deploy the root `docker-compose.yml` as a Coolify Compose resource for full-stack self-hosting. Set the same root `.env` values, use a browser-reachable `NEXT_PUBLIC_CORE_API_URL`, and prefer password auth for Postgres instead of trust.

## Common pitfalls

- **Private Docker DNS in the frontend build:** `NEXT_PUBLIC_CORE_API_URL=http://backend:8000/v3` works only inside the Compose network, not in the user’s browser. Use `localhost` locally or your public API hostname in staging/production.
- **Missing secrets in live envs:** `staging` / `production` require `JWT_PUBLIC_KEY`, `JWT_PRIVATE_KEY`, `OTP_SECRET_KEY`, and `PORTAL_URL`.
- **Stale frontend after env changes:** rebuild the frontend image after changing `NEXT_PUBLIC_*`.
- **Port differences outside Docker:** Compose uses frontend `8080` and backend `8000`. Local non-Docker setups may use other ports (see [frontend](../frontend/README.md) and [backend](../backend/README.md) docs).

## Service images only

To build a single service without Compose:

```bash
docker build -t lanms-backend ./backend
docker build -t lanms-frontend \
  --build-arg NEXT_PUBLIC_ENV=local \
  --build-arg NEXT_PUBLIC_CORE_API_URL=http://localhost:8000/v3 \
  ./frontend
docker build -t lanms-postgres ./postgres
```
