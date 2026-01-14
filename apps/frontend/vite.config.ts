import { existsSync } from 'node:fs'
import { cloudflare } from '@cloudflare/vite-plugin'
import { reactRouter } from '@react-router/dev/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// Use wrangler.local.jsonc if it exists, otherwise fall back to wrangler.jsonc
const wranglerConfig = existsSync('./wrangler.local.jsonc')
  ? './wrangler.local.jsonc'
  : './wrangler.jsonc'

export default defineConfig({
  plugins: [
    cloudflare({
      viteEnvironment: { name: 'ssr' },
      configPath: wranglerConfig,
    }),
    reactRouter(),
    tsconfigPaths(),
  ],
})
