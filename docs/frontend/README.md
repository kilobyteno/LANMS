# LANMS - Frontend

The frontend for LANMS. For the backend, see the [backend readme](../backend/README.md) or the [root readme](../../README.md).

Run the commands below from the `frontend/` directory at the repository root.

## Development

Make a copy of the [`.env.example`](../../frontend/.env.example) file and rename it to `.env.local` (or `.env`). Set `NEXT_PUBLIC_CORE_API_URL` to your LANMS API base URL (for example `http://127.0.0.1:8001/v3`) and optional `NEXT_PUBLIC_ENV`.

```bash
cp .env.example .env.local
```

Install the dependencies:

```bash
npm install
```

Run the development server (Next.js):

```bash
npm run dev
```

Production build and local run:

```bash
npm run build
npm run start
```

Sandbox/staging builds load env from `.env.sandbox` / `.env.staging` via `npm run build:sandbox` and `npm run build:staging`.

Update the translation files:

```bash
npm run trans
```

## Deployment

The frontend is deployed to the staging environment automatically when a commit is pushed to the `develop` branch, please create a pull request from the your branch to the `develop` branch and once that is merged, the frontend will be deployed to the staging environment.
