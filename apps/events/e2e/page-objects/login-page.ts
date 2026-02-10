import type { Page } from '@playwright/test'

export class LoginPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async goto() {
    await this.page.goto('/login')
  }

  async submitLogin({ email, password }: { email: string; password: string }) {
    await this.page.getByLabel('Sähköposti').fill(email)
    await this.page.getByLabel('Salasana').fill(password)
    await this.page.getByTestId('submit-login').click()
  }
}
