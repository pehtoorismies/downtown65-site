import { applyD1Migrations, env } from 'cloudflare:test'

// Setup files run outside isolated storage, and may be run multiple times.
// `applyD1Migrations()` only applies migrations that haven't already been
// applied, therefore it is safe to call this function here.
//
// NOTE: Watch mode is not supported with @cloudflare/vitest-pool-workers D1.
// The D1 binding becomes stale after file changes. Run tests without --watch.
await applyD1Migrations(env.D1_DB, env.TEST_MIGRATIONS)
