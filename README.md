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

The code does not create any database objects yet; we’ll add those in the next step.

Business case builder for consulting organization
