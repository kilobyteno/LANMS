# LANMS - Backend

The backend for LANMS. For the frontend, see [frontend readme](/frontend/README.md) or the [root readme](/README.md).

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

### Bootstrap initial user (first deployment)

For a new environment you can create the first login user from the environment (see `.env.example`):

- `INITIAL_USER_EMAIL` — email used to sign in
- `INITIAL_USER_PASSWORD` — must be at least `PASSWORD_MIN_LENGTH` characters (default 12)

Set these only when you intend to run the bootstrap command; the API does not require them at runtime.

After the database exists and migrations have been applied, run:

```bash
uv run alembic upgrade head
uv run python create_initial_user.py
```

The script uses the same `.env` / environment as the application (database URL, JWT keys, and so on). It is **idempotent**: if an active user with that email already exists, it exits successfully and does nothing. The user is created with a verified email and accepted terms/privacy timestamps so they can use the normal login flow without completing OTP signup.

## Deployment

The backend is deployed to the staging environment automatically when a commit is pushed to the `develop` branch. Create a pull request from your branch to `develop`; once it is merged, the backend is deployed to staging.

Wire `create_initial_user.py` into your first-deploy procedure if you rely on env-driven bootstrap (for example run it once after migrations, with `INITIAL_USER_EMAIL` and `INITIAL_USER_PASSWORD` set in the deployment secrets, then clear or unset those variables if your policy requires it).