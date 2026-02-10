import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test as setup } from '@playwright/test'
import { LoginPage } from './page-objects/login-page'
import { testUser } from './test-user'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const authFile = join(__dirname, '../playwright/.auth/user.json')

setup('authenticate', async ({ page }) => {
  const loginPage = new LoginPage(page)
  await loginPage.goto()
  await loginPage.submitLogin({
    email: testUser.email,
    password: testUser.password,
  })
  await page.waitForURL(/.*events/)
  await page.context().storageState({ path: authFile })
})
