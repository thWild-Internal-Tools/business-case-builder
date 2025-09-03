# Business Case Builder

This repository contains a full‑stack TypeScript application scaffolded with:

- Node.js + Express for the server (TypeScript)
- React + Vite for the client (TypeScript)
- Tailwind (via CDN) + Font Awesome + ApexCharts included in the client `index.html`

Database objects will be added next. The server is already wired to read a Postgres connection string from `DATABASE_URL`.

## Structure

- `server/` – Express API, services, and database client
- `client/` – Vite React app that renders the Dashboard design
- `Design Templates/` – Original design source (`dashboard.html`)

## Quick Start

1) Server

- Copy env: `cp server/.env.example server/.env` and set `DATABASE_URL`.
- Install deps: `cd server && npm install`
- Dev: `npm run dev`
- Prod build: `npm run build && npm start`

2) Client

- Install deps: `cd client && npm install`
- Dev: `npm run dev` (open the printed URL)
- Prod build: `npm run build && npm run preview`

## Database

Set `DATABASE_URL` in `server/.env` to your Postgres connection string. Example (Neon):

psql 'postgresql://neondb_owner:npg_r3jQvGtl9knJ@ep-ancient-brook-ad95mtah-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

### Schema & migrations

- Initial schema is in `server/migrations/001_init.sql`.
- Apply migrations:
  - With Node: `cd server && npm run db:migrate`
  - Or with psql: `psql "$DATABASE_URL" -f server/migrations/001_init.sql`

The migration runner records applied files in `__migrations` and verifies checksums to prevent accidental edits of applied migrations.

Business case builder for consulting organization

## API

Base URL: `/api`

- `GET /api/clients` – list clients
- `POST /api/clients` – create `{ name, notes? }`
- `GET /api/clients/:id` – get one
- `PUT /api/clients/:id` – update `{ name?, notes? }`
- `DELETE /api/clients/:id` – delete (cascades to cases)

- `GET /api/cases` – list cases
- `POST /api/cases` – create `{ client_id, title, description?, status? }`
- `GET /api/cases/:id` – get one
- `PUT /api/cases/:id` – update any of the create fields
- `DELETE /api/cases/:id` – delete case

- `GET /api/cost-items?case_id=...` – list cost items (optionally filter by case)
- `POST /api/cost-items` – create `{ case_id, name, amount, category?, notes? }`
- `GET /api/cost-items/:id` – get one
- `PUT /api/cost-items/:id` – update fields
- `DELETE /api/cost-items/:id` – delete

- `GET /api/revenue-items?case_id=...` – list revenue items (optionally filter by case)
- `POST /api/revenue-items` – create `{ case_id, name, amount, category?, notes? }`
- `GET /api/revenue-items/:id` – get one
- `PUT /api/revenue-items/:id` – update fields
- `DELETE /api/revenue-items/:id` – delete

- `GET /api/cost-timing?cost_item_id=...` – list cost timing (optional filter)
- `POST /api/cost-timing` – create `{ cost_item_id, start_date?, end_date?, recurrence_interval_months?, notes? }`
- `GET /api/cost-timing/:id` – get one
- `PUT /api/cost-timing/:id` – update fields
- `DELETE /api/cost-timing/:id` – delete

- `GET /api/revenue-timing?revenue_item_id=...` – list revenue timing (optional filter)
- `POST /api/revenue-timing` – create `{ revenue_item_id, start_date?, end_date?, recurrence_interval_months?, notes? }`
- `GET /api/revenue-timing/:id` – get one
- `PUT /api/revenue-timing/:id` – update fields
- `DELETE /api/revenue-timing/:id` – delete
