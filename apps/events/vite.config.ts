/** biome-ignore-all lint/suspicious/noConsole: CLI script */
import { cloudflare } from '@cloudflare/vite-plugin'
import { reactRouter } from '@react-router/dev/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const getWranglerConfig = (): string => {
  if (!process.env.CI) {
    console.log('Running locally, using wrangler.local.jsonc')
    return './wrangler.local.jsonc'
  }
  if (process.env.CLOUDFLARE_ENV === 'pull-request') {
    console.log('Running in CI for pull request, using wrangler.pr.jsonc')
    return './wrangler.pr.jsonc'
  } else {
    console.log('Running in CI, using wrangler.jsonc')
    return './wrangler.jsonc'
  }
}

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 800,
  },
  plugins: [
    cloudflare({
      configPath: getWranglerConfig(),
      viteEnvironment: { name: 'ssr' },
    }),
    reactRouter(),
    tsconfigPaths(),
  ],
})
