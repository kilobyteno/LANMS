# LANMS - Backend

The backend for LANMS. For the frontend, see the [frontend readme](../frontend/README.md) or the [root readme](../../README.md).

Run the commands below from the `backend/` directory at the repository root.

## Configuration

For the backend to be able to run in all environments these environment variables need to be set:

* **ENV**

  The following values are allowed:

  * `dev` or `local` for developers and local environment
  * `staging` for test environment that is set up like prod but only used for testing
  * `production` or `prod` for your production environment

* **JWT_PUBLIC_KEY**

  PEM-encoded **public** half of an RSA key pair, used to verify JWTs (default algorithm is `RS256`). In `.env`, you can embed newlines as literal `\n` sequences; the app normalizes them on load.

* **JWT_PRIVATE_KEY**

  PEM-encoded **private** half of the same RSA key pair, used to sign access and refresh tokens. Keep this secret and never commit it. Same newline rules as `JWT_PUBLIC_KEY`.

* **PORTAL_URL** — ex. `https://portal.lanms.net`

  The URL for the frontend where that is hosted; used for links in emails.

* **OTP_SECRET_KEY**

  Secret used for OTP generation (TOTP-style). Use a strong value; in development you can use a Base32-style string similar to `.env.example`.

### Optional configuration

* `CODE_BUILD`
* `DEBUG`
* `DATABASE_DEBUG` — when set, enables SQLAlchemy echo logging
* `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD`, `DB_PORT`, `DB_DIALECT`, `DB_NAME`
* `JWT_ALGORITHM`
* `ACCESS_TOKEN_EXPIRE_MINUTES`, `REFRESH_TOKEN_EXPIRE_MINUTES`
* `FROM_EMAIL`
* `SENTRY_DSN`
* `SENDGRID_API_KEY`, `POSTMARK_API_KEY`
* `PASSWORD_MIN_LENGTH`
* `MAX_IMAGE_SIZE_KB`, `MAX_FILE_SIZE_KB`
* `SUPER_ADMINS`
* **First deployment only:** `INITIAL_USER_EMAIL` and `INITIAL_USER_PASSWORD` — used by `create_initial_user.py` to create the first login user after migrations (see [Bootstrap initial user](#bootstrap-initial-user-first-deployment)). Leave unset or empty when not running that script.

## Development

Make a copy of the `.env.example` file and rename it to `.env`. Fill in the required environment variables.

```bash
cp .env.example .env
```

Install [uv](https://docs.astral.sh/uv/getting-started/installation/), then install dependencies (runtime and dev):

```bash
uv sync --all-groups
```

Activate pre-commit hooks:

```bash
uv run pre-commit install
```

### Code styling

We use Ruff for code styling and formatting. To run code styling check manually you can run:

```bash
uv run ruff check --fix
```

For formatting code you can run:

```bash
uv run ruff format
```

Use pre-commit to do this automatically.

### Tests

Run the test suite with:

```bash
uv run pytest
```

Tests set `ENV=test` and use an in-memory SQLite database (see `tests/conftest.py`); you do not need Postgres running locally for them. Pull requests that touch `backend/**` run Ruff and pytest in CI.

### Migrations

#### Create a new migration

To create a new migration, run the following command:

```bash
uv run alembic revision --autogenerate -m "migration message"
```

#### Migrate changes

To run the migrations, run the following command:

```bash
uv run alembic upgrade head
```

### Bootstrap initial user (first deployment)

For a new environment you can create the first login user from the environment (see `.env.example`):

* `INITIAL_USER_EMAIL` — email used to sign in
* `INITIAL_USER_PASSWORD` — must be at least `PASSWORD_MIN_LENGTH` characters (default 12)

Set these only when you intend to run the bootstrap command; the API does not require them for normal operation.

After the database exists and migrations have been applied:

```bash
uv run alembic upgrade head
uv run python create_initial_user.py
```

The script uses the same `.env` as the application. It is **idempotent**: if an active user with that email already exists, it exits successfully and does nothing. The user is created with a verified email and accepted terms/privacy timestamps so they can use the normal login flow without completing OTP signup.

On first deploy, run this once after migrations if you rely on env-driven bootstrap. Clear or rotate `INITIAL_USER_PASSWORD` in your secrets store afterward if your policy requires it.

## Deployment

The backend is deployed to the staging environment automatically when a commit is pushed to the `develop` branch. Create a pull request from your branch to `develop`; once it is merged, the backend is deployed to staging.
