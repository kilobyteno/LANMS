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