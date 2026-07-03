# Jupiter GSM Dashboard

Jupiter GSM Dashboard is a decision-support dashboard for a Dubai mobile phone wholesale trading team. It sits on top of Al Ameen ERP exports and centralizes inventory snapshots, product normalization, supplier/customer context, import history, and analytics. It does not replace ERP operations.

## Stack

- Frontend: React 19, TypeScript, Vite, TailwindCSS, shadcn-style UI primitives, TanStack Router, TanStack Query, React Hook Form, Zod, Recharts
- Backend: NestJS, Prisma ORM, PostgreSQL, JWT auth with refresh tokens, RBAC, Swagger, Winston, Helmet, throttling, validation pipes, global exception filter
- Deployment: Docker Compose for frontend, backend, PostgreSQL, and pgAdmin

## Quick Start

```bash
npm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
npm run setup:local
npm run dev
```

Frontend: http://localhost:5173  
API: http://localhost:3000/api  
Swagger: http://localhost:3000/docs  
pgAdmin: http://localhost:5050

Seeded admin credentials:

- Email: `admin@tradingcopilot.local`
- Password: `Admin@123456`

## Docker

```bash
docker compose up --build
```

The API container runs Prisma migrations before starting. PostgreSQL data is persisted in the `postgres_data` volume.

## Al Ameen Inventory Imports

Each uploaded Excel file creates a new immutable `InventorySnapshot`. Existing inventory rows are never overwritten. The import pipeline supports `.xlsx` and legacy `.xls`, previews parsed rows, stores import metadata, inserts valid inventory items, records invalid rows, and writes audit logs.

Expected workbook columns:

- `Product Code`
- `Latin Name`
- `Quantity`
- `Unit`
- `Price`
- `Total Price`
- `Store`

If an import contains both valid and invalid rows, valid rows are imported and invalid rows are recorded in the import history. If no valid inventory rows are found, the import is rejected.

## Production Notes

- Replace all secrets in `.env` files.
- Set `NODE_ENV=production`.
- Use managed PostgreSQL with backups and point-in-time recovery.
- Serve the frontend through a CDN or hardened reverse proxy.
- Restrict Swagger to trusted networks if needed.
- Configure structured log shipping from the API container.
