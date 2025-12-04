import path from 'node:path'
import { defineWorkersProject } from '@cloudflare/vitest-pool-workers/config'

export default defineWorkersProject(() => {
  return {
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './src'),
      },
    },
    test: {
      environment: 'node',
      coverage: {
        reporter: ['text', 'lcov'],
      },
      globals: true,
      poolOptions: {
        workers: { wrangler: { configPath: './wrangler.jsonc' } },
      },
    },
  }
})
