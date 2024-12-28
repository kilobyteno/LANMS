# LANMS - Backend

The backend for LANMS. For the frontend, see [frontend readme](/frontend/README.md).

## Development

Make a copy of the `.env.example` file and rename it to `.env`. Fill in the required environment variables.

```bash
cp .env.example .env
```

Install the dependencies:

```bash
pip install -r requirements-dev.txt
```

Activate pre-commit hooks:

```bash
pre-commit install
```

### Migrations

#### Create a new migration

To create a new migration, run the following command:

```bash
alembic revision --autogenerate -m "migration message"
```

#### Migrate changes

To run the migrations, run the following command:

```bash
alembic upgrade head
```

### Seeding the database

We have made it easy to seed the database by either creating entries or updating existing entries. Run the following command to get the help menu, to see the
available options:

```bash
python seed.py --help
```

To seed the database by updating or creating entries, run the following command:

```bash
python seed.py --table all --auto
```
