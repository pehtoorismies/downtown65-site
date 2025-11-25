# Event Planner Monorepo

A pnpm workspace containing a Hono-powered backend API and a React + Mantine frontend for managing event records (with participant details). Tooling includes Biome for lint/format, Vitest for backend unit tests, and Playwright for frontend E2E coverage.

## Requirements

- Node.js 22+
- pnpm (managed via Corepack)

## Getting started

```bash
pnpm install
```

### Backend (Hono API)

```bash
pnpm dev:backend
```

- REST endpoints under `http://localhost:3000/events`
- OpenAPI spec at `http://localhost:3000/openapi.json`
- Scalar UI at `http://localhost:3000/docs`

### Frontend (React + Mantine)

```bash
pnpm dev:frontend
```

The client expects the API at `VITE_API_URL` (defaults to `http://localhost:3000`).

## Testing & quality

| Command | Purpose |
| --- | --- |
| `pnpm --filter backend test` | Backend unit tests (Vitest) |
| `pnpm --filter frontend test:e2e` | Playwright E2E tests (starts backend & frontend) |
| `pnpm lint` | Run Biome across all workspaces |
| `pnpm format` | Format via Biome |

## Project layout

```
apps/
  backend/   # Hono API, OpenAPI schema, Vitest unit tests
  frontend/  # Vite + React UI, Mantine components, Playwright tests
```
