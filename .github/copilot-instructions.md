# AI Coding Agent Instructions

## Architecture Overview

This is a **pnpm monorepo** with a Cloudflare Workers backend and React Router frontend for event management.

**Structure:**
- `apps/backend/` - Hono API with OpenAPI, Drizzle ORM (D1), Auth0 JWT, running on Cloudflare Workers
- `apps/frontend/` - React Router 7 with Mantine UI, SSR via Cloudflare Pages
- `packages/schema/` - Shared Zod schemas with `.openapi()` extensions for type-safe API contracts
- `packages/logger/` - Shared logging utility

**Type Flow:** Backend generates OpenAPI → `openapi-typescript` generates frontend types → Type-safe API client via `openapi-fetch`

## Development Commands

```bash
# Development (run from monorepo root)
pnpm dev:backend          # Backend at :3002 with wrangler
pnpm dev:frontend         # Frontend at :5173 with HMR

# Type Generation Pipeline (critical for frontend-backend sync)
pnpm --filter backend generate:openapi    # Backend generates .generated/openapi.json
pnpm --filter frontend generate:api-types:file  # Frontend generates typed client from OpenAPI

# Testing
pnpm --filter backend test     # Vitest with @cloudflare/vitest-pool-workers
pnpm --filter frontend test:e2e # Playwright (auto-starts both servers)

# Linting & Formatting (Biome, not ESLint/Prettier)
pnpm lint                      # Check all workspaces
pnpm format                    # Format all workspaces
```

## Backend Patterns

### Route Structure
Routes follow a **component-based structure** (not REST resource folders):
- Each component in `apps/backend/src/components/{component}/routes/` exports route files
- Example: `get-events.ts`, `post-events.ts`, `delete-events.ts`
- Each route file exports a `register(app: AppAPI)` function
- Routes are registered in `routes/index.ts` then imported in `server.ts`

**Example route pattern:**
```typescript
// apps/backend/src/components/events/routes/get-events.ts
import { createRoute } from '@hono/zod-openapi'
import type { AppAPI } from '~/app-api'

const route = createRoute({
  method: 'get',
  path: '/events',
  security: [{ ApiKeyAuth: [], BearerToken: [] }],
  middleware: [apiKeyAuth, jwtToken()],
  responses: { 200: { schema: EventListSchema } },
})

export const register = (app: AppAPI) => {
  app.openapi(route, async (c) => {
    const events = await getEvents(getConfig(c.env))
    return c.json(events, 200)
  })
}
```

### Authentication & Security
- **Dual auth:** API key (`x-api-key` header) + JWT Bearer token (Auth0)
- Middleware: `apiKeyAuth` (required for all protected routes) + `jwtToken()` (optional `allowAnon`)
- JWT payload is stored in `c.var.jwtPayload` after validation
- Secrets managed via `wrangler secret put` (see `API_KEY_SETUP.md`)

### Database
- **Drizzle ORM** with D1 (SQLite) binding: `c.env.D1_DB`
- Schema: `apps/backend/src/db/schema.ts` (users, events, usersToEvent junction)
- Migrations stored flat in `drizzle_flat/` (wrangler requirement, use `scripts/drizzle_flatten.sh`)
- Get DB client: `getDb(config.D1_DB)`

### Configuration
- Environment variables validated via Zod in `common/config/config.ts`
- Use `getConfig(c.env)` to access typed config in routes
- Required env vars: `AUTH_DOMAIN`, `AUTH_CLIENT_ID`, `AUTH_CLIENT_SECRET`, `AUTH_AUDIENCE`, `API_KEY`, `REGISTER_SECRET`

### Testing
- Uses Vitest with `@cloudflare/vitest-pool-workers` to simulate Cloudflare Workers environment
- Import `env` from `cloudflare:test` for test bindings
- Test pattern: `describe.each()` for route variations (see `protected-routes.spec.ts`)
- Export app as default from `server.ts` for testing

## Frontend Patterns

### Type-Safe API Client
```typescript
// Generated types from backend OpenAPI
import type { paths } from './+types/api.d'
import createClient from 'openapi-fetch'

const client = createClient<paths>({ baseUrl: apiHost })
const { data, error } = await client.GET('/events')
```

### React Router 7 Conventions
- **File-based routing:** `app/routes/` with underscore prefixes for layout routes (`_auth.login/`)
- **Type-safe routes:** Generate with `pnpm --filter frontend generate:react-router-types`
- Import route types: `import type { Route } from './+types/route'`
- Use `Route.ActionArgs`, `Route.LoaderArgs` for type-safe data functions

### Middleware & Auth
- Middleware defined in route files: `export const middleware = [authMiddleware({ allowAnonymous: false })]`
- Auth context: `context.get(AuthContext)` provides `{ user, accessToken }` or `null`
- Session management: `createSessionManager(context.cloudflare.env)` handles Auth0 cookies

### Components
- **Mantine UI** for components (not Tailwind, despite boilerplate README)
- Custom theme in `app-theme.tsx`
- CSS modules for custom styles (e.g., `navigation.module.css`)

## Shared Patterns

### Zod Schemas
- Shared schemas in `packages/schema/src/index.ts`
- All schemas use `.openapi()` extension for OpenAPI compatibility
- Custom refinements: ULIDs validated with `isValidULID()`, Auth0 subjects with `.startsWith('auth0|')`

### Logging
- Use `@downtown65/logger` for structured logging
- Pattern: `const logger = createLogger({ appContext: 'ComponentName' })`
- Methods: `.info()`, `.warn()`, `.error()`, `.withMetadata()`, `.withContext()`

### Workspace Dependencies
- Use `workspace:*` for internal package dependencies
- Packages auto-link via pnpm, no manual symlinking needed

## Critical "Gotchas"

1. **OpenAPI type generation is manual:** Run `pnpm ci:generate` before CI or when backend schemas change
2. **D1 migrations must be flat:** Use `scripts/drizzle_flatten.sh` after generating migrations
3. **Wrangler dev port:** Backend runs on port `3002` (not 3000 as README states)
4. **Biome semicolons:** Configured for `asNeeded` (not required), single quotes
5. **No console.log:** Biome errors on console.log/info (use logger or console.warn/error)
6. **Path aliases:** Backend uses `~` for `./src`, frontend uses `~` for `./app` (check tsconfig.json)
7. **Cloudflare bindings:** Frontend and backend both generate worker types with `generate:cf` (from wrangler.jsonc)
