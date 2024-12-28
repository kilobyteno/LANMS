# LANMS - Frontend

The frontend for LANMS. For the backend, see [backend readme](/backend/README.md) or the [root readme](/README.md).

## Development

Make a copy of the `.env.example` file and rename it to `.env`. Fill in the required environment variables.

```bash
cp .env.example .env
```

Install the dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Update the translation files:

```bash
npm run trans
```

## Deployment

The frontend is deployed to the staging environment automatically when a commit is pushed to the `develop` branch, please create a pull request from the your branch to the `develop` branch and once that is merged, the frontend will be deployed to the staging environment.