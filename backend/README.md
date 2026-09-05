# Production-Ready FastAPI Backend Starter

A production-grade, feature-first clean architecture FastAPI starter equipped with JWT authentication, dual database support (PostgreSQL and SQLite), database health checking, Alembic migrations, Pytest async test suite, and complete Docker support.

---

## Architecture & Project Structure

The project follows a **Feature-First Clean Architecture** pattern:

```text
backend/
├── app/
│   ├── main.py                   # FastAPI initialization, middleware & routes
│   ├── core/                     # Core configs, DB setup, security, exceptions
│   │   ├── config.py             # Pydantic Settings & ENV configuration
│   │   ├── database.py           # Async SQLAlchemy 2.0 engine & session maker
│   │   ├── security.py           # Bcrypt password hashing & JWT token handling
│   │   └── exceptions.py         # Centralized error handling & custom exceptions
│   ├── features/                 # Modular business features
│   │   ├── health/               # Health feature (/health, /health/db)
│   │   │   ├── router.py
│   │   │   ├── schemas.py
│   │   │   └── service.py
│   │   ├── auth/                 # Auth feature (/auth/register, /auth/login, etc.)
│   │   │   ├── router.py
│   │   │   ├── schemas.py
│   │   │   ├── service.py
│   │   │   └── dependencies.py
│   │   └── users/                # Users feature
│   │       ├── models.py         # SQLAlchemy User ORM Entity
│   │       ├── schemas.py        # Pydantic User schemas
│   │       ├── repository.py     # Database CRUD repository
│   │       └── router.py         # User endpoints
│   └── api/
│       └── v1/
│           └── api.py            # API Router aggregator (/api/v1)
├── alembic/                      # Alembic Database Migrations
├── tests/                        # Async Pytest suite
│   ├── conftest.py
│   ├── test_health.py
│   └── test_auth.py
├── Dockerfile                    # Production Docker build definition
├── docker-compose.yml            # Docker Compose with PostgreSQL service
├── .env.example                  # Environment configuration template
├── .gitignore                    # Ignore rules for git
└── requirements.txt              # Project dependencies
```

---

## Features Included

- **Authentication & Security**: JWT Access & Refresh Token workflow, password hashing using `bcrypt`.
- **Flexible Database Layer**: Async SQLAlchemy 2.0 with native support for both **PostgreSQL** (`asyncpg`) and **SQLite** (`aiosqlite`).
- **Health Endpoints**:
  - `GET /health`: System & application runtime status.
  - `GET /health/db`: Deep database ping, driver latency measurement, and health check.
-  **Docker Ready**: Multistage production `Dockerfile` with non-root security and a `docker-compose.yml` pre-configured with PostgreSQL 16.
- **Comprehensive Test Suite**: Async unit and integration tests using `pytest` and `httpx`.
- **Database Migrations**: Pre-configured `Alembic` with async driver support.

---

## Quick Start (Local Development)

### 1. Set Up Virtual Environment

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

### 3. Run FastAPI Application

By default, `.env` points to local SQLite (`sqlite+aiosqlite:///./app.db`).

```bash
uvicorn app.main:app --reload --port 8000
```

Access API Documentation:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## Running with Docker & Docker Compose

To launch the full stack (FastAPI app + PostgreSQL database) inside Docker:

```bash
docker-compose up --build
```

Services started:
- **API**: `http://localhost:8000`
- **PostgreSQL**: `localhost:5432`

To tear down containers and volume data:
```bash
docker-compose down -v
```

---

##  Database Switching: SQLite vs PostgreSQL

### Using SQLite (Local / Dev / Testing)
In `.env`:
```env
DATABASE_URL="sqlite+aiosqlite:///./app.db"
```

### Using PostgreSQL
In `.env` (Local PostgreSQL):
```env
DATABASE_URL="postgresql+asyncpg://postgres:postgrespassword@localhost:5432/app_db"
```

In `docker-compose.yml` (Dockerized PostgreSQL):
```env
DATABASE_URL="postgresql+asyncpg://postgres:postgrespassword@db:5432/app_db"
```

---

##  Running Tests

```bash
pytest
```

---

## Alembic Database Migrations

Generate initial migration:
```bash
alembic revision --autogenerate -m "Initial schema"
```

Apply migrations:
```bash
alembic upgrade head
```
