import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(rootDir, '../..')

dotenv.config({ path: path.resolve(rootDir, '.env.e2e') })

export default defineConfig({
  fullyParallel: true,
  globalSetup: './e2e/global-setup.ts',
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'logged-out',
      testIgnore: /auth\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      dependencies: ['setup'],
      name: 'chromium',
      testIgnore: /auth\.setup\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
    },
  ],
  retries: process.env.CI ? 2 : 0,
  testDir: './e2e',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'pnpm dev:e2e',
      cwd: `${workspaceRoot}/apps/api`,
      reuseExistingServer: !process.env.CI,
      stderr: 'pipe',
      stdout: 'pipe',
      url: 'http://localhost:3002/healthz',
    },
    {
      command: 'pnpm dev',
      cwd: `${workspaceRoot}/apps/events`,
      reuseExistingServer: !process.env.CI,
      stderr: 'pipe',
      stdout: 'pipe',
      url: 'http://localhost:5173',
    },
  ],
})
