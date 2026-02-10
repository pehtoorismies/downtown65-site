# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **pnpm monorepo** for an event management application deployed entirely on Cloudflare infrastructure:
- `apps/api/` - Hono REST API with OpenAPI, Drizzle ORM (D1), Auth0 JWT, running on Cloudflare Workers
- `apps/events/` - React Router 7 frontend with Mantine UI, SSR via Cloudflare Pages
- `apps/www/` - Astro static site for public homepage
- `packages/schema/` - Shared Zod schemas with `.openapi()` extensions for type-safe API contracts
- `packages/logger/` - Shared logging utility
- `packages/wrangler-config/` - CLI tool for generating environment-specific Wrangler configs

## Development Commands

**Start development servers:**
```bash
pnpm dev:api        # API at localhost:3002 with Wrangler
pnpm dev:events     # Events frontend at localhost:5173
pnpm dev:www        # WWW site at localhost:4321
```

**Type generation (critical for frontend-backend sync):**
```bash
pnpm --filter api generate:openapi           # Generate OpenAPI spec from backend routes
pnpm --filter events generate:api-types:file # Generate typed API client for frontend from spec file
pnpm --filter events generate:api-types:server # Generate from running local API server
pnpm ci:generate                             # Run all type generation (used in CI)
```

**Testing:**
```bash
pnpm test                    # Run tests across all workspaces
pnpm --filter api test       # Backend unit tests (Vitest + Cloudflare Workers pool)
pnpm --filter events test    # Frontend tests
```

**Code quality:**
```bash
pnpm lint         # Biome linting (all workspaces)
pnpm format       # Format with Biome
pnpm typecheck    # TypeScript type checking
pnpm knip         # Find unused code/dependencies
```

**Database:**
```bash
pnpm --filter api seed:local            # Seed local D1 database with data
pnpm --filter api seed:remote --db=<DB_NAME> --env=<ENV>  # Seed remote database
pnpm --filter api migrations:flatten    # Flatten Drizzle migrations for Wrangler
```

**Other:**
```bash
pnpm build        # Build all apps
pnpm clean        # Remove node_modules and build artifacts
```

## Architecture Patterns

### API (Hono Backend)

**Route structure:** Component-based (not REST resource folders)
- Routes live in `apps/api/src/components/{component}/routes/`
- Each route file exports a `register(app: AppAPI)` function
- Routes registered in `routes/index.ts`, imported in `server.ts`

**Authentication:** Dual auth required for protected routes
- API key via `x-api-key` header (middleware: `apiKeyAuth`)
- Auth0 JWT Bearer token (middleware: `jwtToken()`, supports `allowAnon` option)
- JWT payload accessible via `c.var.jwtPayload` after validation

**Database:**
- Drizzle ORM with Cloudflare D1 (SQLite) binding: `c.env.D1_DB`
- Schema: `apps/api/src/db/schema.ts`
- Migrations in `drizzle_flat/` (flattened for Wrangler, use `scripts/drizzle_flatten.sh`)
- Get client: `getDb(config.D1_DB)`

**Configuration:**
- Environment variables validated via Zod in `common/config/config.ts`
- Access typed config: `getConfig(c.env)`

**Testing:**
- Uses `@cloudflare/vitest-pool-workers` to simulate Cloudflare Workers environment
- Import `env` from `cloudflare:test` for test bindings

### Events (React Router Frontend)

**Type-safe API client:**
```typescript
import type { paths } from './+types/api.d'
import createClient from 'openapi-fetch'

const client = createClient<paths>({ baseUrl: apiHost })
const { data, error } = await client.GET('/events')
```

**Routing:**
- File-based routing in `app/routes/`
- Underscore prefixes for layout routes (e.g., `_auth.login/`)
- Generate types: `pnpm --filter events generate:react-router-types`
- Import route types: `import type { Route } from './+types/route'`

**Authentication:**
- Middleware in route files: `export const middleware = [authMiddleware({ allowAnonymous: false })]`
- Auth context: `context.get(AuthContext)` provides `{ user, accessToken }` or `null`
- Session management via `createSessionManager(context.cloudflare.env)`

**UI:**
- Mantine UI component library (not Tailwind)
- Custom theme in `app-theme.tsx`
- CSS modules for custom styles

### WWW (Astro Site)

- Static site with Tailwind CSS
- Cloudflare Pages adapter for deployment

### Shared Packages

**Schemas:**
- All schemas in `packages/schema/src/index.ts`
- Use `.openapi()` extension for OpenAPI compatibility
- Custom refinements: ULIDs validated with `isValidULID()`, Auth0 subjects with `.startsWith('auth0|')`
- **Branded types:** Use Zod `.parse()` for branded types like `ISODate` and `ISOTime` instead of type assertions:
  ```typescript
  // Correct - validates and returns branded type
  ISODateSchema.parse('2027-12-01')
  ISOTimeSchema.parse('18:00')
  
  // Wrong - bypasses validation
  '2027-12-01' as ISODate
  ```

**Logging:**
- Use `@downtown65/logger` instead of console.log
- Pattern: `const logger = createLogger({ appContext: 'ComponentName' })`

**Dependencies:**
- Use `workspace:*` for internal package references in package.json

## Deployment

### Environments

Three deployment environments with automatic CI/CD via GitHub Actions:

1. **Pull Request (Development)** - Branch: `staging`
   - URLs: `https://{app}-pr-{PR_NUMBER}.downtown65.com`
   - Database: `pr-{PR_NUMBER}-dt65-events` (created/destroyed per PR)
   - Uses `wrangler.pr.template.jsonc` with variable substitution

2. **Staging (Pre-Production)** - Branch: `staging`
   - URLs: `https://{app}-staging.downtown65.com`
   - Database: `staging-dt65-events`
   - Uses `wrangler.deploy.jsonc` staging environment

3. **Production** - Branch: `main`
   - URLs: `https://{app}.downtown65.com` (www uses `www.downtown65.com`)
   - Database: `production-dt65-events`
   - Uses `wrangler.deploy.jsonc` production environment

### Deployment Flow

- PRs to `staging` → Automatically deploys only changed apps to PR preview environment
- Push to `staging` → Auto-deploy to staging environment
- Merge `staging` to `main` → Auto-deploy to production
- PR closure → Automatic cleanup of PR resources (Workers, Pages, D1 databases)

**Smart deployment:** Only apps with changed files (detected via git diff) are deployed in PR workflows

### Wrangler Configuration

**DO NOT manually edit `wrangler.jsonc` files** - they are auto-generated:

**API:**
- Local: `pnpm --filter api generate:wrangler-config-local` (requires `WRANGLER_DATABASE_ID` env var)
- Uses templates: `wrangler.local.template.jsonc`, `wrangler.pr.template.jsonc`
- Deploy config: `wrangler.deploy.jsonc` (staging/production)

**Events:**
- Local: Uses static `wrangler.local.jsonc`
- Uses templates: `wrangler.pr.template.jsonc`
- Deploy config: `wrangler.deploy.jsonc` (staging/production)

**Wrangler Config CLI:**
The `@downtown65/wrangler-config` package provides a CLI tool for generating configs:
```bash
# In apps/api or apps/events:
generate-wrangler-config local <USERNAME> [DATABASE_ID]
generate-wrangler-config pr <PR_NUMBER> [DATABASE_ID]
```

## Critical Gotchas

1. **OpenAPI type generation is manual** - Run `pnpm ci:generate` before CI or when backend schemas change
2. **D1 migrations must be flat** - Use `scripts/drizzle_flatten.sh` after generating migrations
3. **Backend runs on port 3002** - Not 3000
4. **No console.log** - Biome errors on console.log/info (use logger or console.warn/error)
5. **Path aliases differ** - Backend `~` = `./src`, Frontend `~` = `./app`
6. **Biome config** - Semicolons `asNeeded`, single quotes
7. **Cloudflare bindings** - Generate worker types with `generate:cf` command in each app
8. **Wrangler configs are generated** - Don't edit `wrangler.jsonc` directly; use templates or generator scripts
9. **API local dev requires database ID** - Set `WRANGLER_DATABASE_ID` env var before running `pnpm dev:api`
10. **Events frontend type generation** - Run `pnpm --filter events generate:local` for complete local setup (generates Cloudflare types, React Router types, and API types from local server)
