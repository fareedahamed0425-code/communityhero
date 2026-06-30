# Community Hero

AI-powered hyperlocal civic platform.

## Architecture

- **Frontend:** React 18, Vite, Tailwind CSS, TypeScript
- **Backend:** FastAPI, Python 3.11, SQLAlchemy
- **Database:** PostgreSQL (with PostGIS), Redis
- **AI Stack:** NVIDIA NIM VLM, NeMo Guardrails

## Setup

1. Start database and cache:
   ```bash
   docker-compose up -d
   ```
2. Run backend (see backend/README.md)
3. Run frontend (see frontend/README.md)
