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

  _Further details needed_

* **JWT_PRIVATE_KEY**

  _Further details needed_

* **PORTAL_URL** — ex. `https://portal.lanms.net`

  The URL for the frontend where that is hosted, is used for links in emails.

* **OTP_SECRET_KEY**

  This should be a Base64 string.

### Optional configuration

* `CODE_BUILD`
* `DEBUG`
* `DB_HOST`
* `DB_USERNAME`
* `DB_PASSWORD`
* `DB_PORT`
* `DB_DIALECT`
* `DB_NAME`
* `JWT_ALGORITHM`
* `ACCESS_TOKEN_EXPIRE_MINUTES`
* `REFRESH_TOKEN_EXPIRE_MINUTES`
* `FROM_EMAIL`
* `SENTRY_DSN`
* `SENDGRID_API_KEY`
* `POSTMARK_API_KEY`
* `PASSWORD_MIN_LENGTH`
* `MAX_IMAGE_SIZE_KB`
* `MAX_FILE_SIZE_KB`
* `SUPER_ADMINS`

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

### Seeding the database

We have made it easy to seed the database by either creating entries or updating existing entries. Run the following command to get the help menu, to see the
available options:

```bash
uv run python seed.py --help
```

To seed the database by updating or creating entries, run the following command:

```bash
uv run python seed.py --table all --auto
```

## Deployment

The backend is deployed to the staging environment automatically when a commit is pushed to the `develop` branch, please create a pull request from the your branch to the `develop` branch and once that is merged, the backend will be deployed to the staging environment.
