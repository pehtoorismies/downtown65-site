import path from 'node:path'
import {
  defineWorkersProject,
  readD1Migrations,
} from '@cloudflare/vitest-pool-workers/config'

export default defineWorkersProject(async () => {
  const migrationsPath = path.join(__dirname, 'drizzle_flat')
  const migrations = await readD1Migrations(migrationsPath)

  return {
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './src'),
      },
    },
    test: {
      coverage: {
        reporter: ['text', 'v8'],
      },
      environment: 'node',
      globals: true,
      poolOptions: {
        workers: {
          miniflare: {
            // Add a test-only binding for migrations, so we can apply them in a
            // setup file
            bindings: {
              TEST_MIGRATIONS: migrations,
            },
            compatibilityFlags: [
              'enable_nodejs_tty_module',
              'enable_nodejs_fs_module',
              'enable_nodejs_http_modules',
              'enable_nodejs_perf_hooks_module',
            ],
          },
          singleWorker: true,
          wrangler: {
            configPath: './wrangler.jsonc',
            environment: 'unit-test',
          },
        },
      },
      setupFiles: [
        './src/common/test/jwk-mock.ts',
        './src/common/test/auth0-mock.ts',
        './src/common/test/apply-migrations.ts',
      ],
      silent: true,
      typecheck: {
        tsconfig: './tsconfig.test.json',
      },
    },
  }
})
