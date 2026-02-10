import type { Locator, Page } from '@playwright/test'

export class EventPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async goto(eventULID: string) {
    await this.page.goto(`/events/${eventULID}`)
  }

  // Event details locators
  get title(): Locator {
    return this.page.getByTestId('event-title')
  }

  get subtitle(): Locator {
    return this.page.getByTestId('event-subtitle')
  }

  get date(): Locator {
    return this.page.getByTestId('event-date')
  }

  get location(): Locator {
    return this.page.getByTestId('event-location')
  }

  get eventType(): Locator {
    return this.page.getByTestId('event-type')
  }

  get createdBy(): Locator {
    return this.page.getByTestId('event-created-by')
  }

  get participantCount(): Locator {
    return this.page.getByTestId('event-participant-count')
  }

  // Action buttons
  get participateButton(): Locator {
    return this.page.getByTestId('participate')
  }

  get leaveButton(): Locator {
    return this.page.getByTestId('leave')
  }

  get loginButton(): Locator {
    return this.page.getByTestId('event-goto-login')
  }

  get modifyButton(): Locator {
    return this.page.getByTestId('modify-event-btn')
  }

  get deleteButton(): Locator {
    return this.page.getByTestId('delete-event-btn')
  }

  // Delete modal
  get deleteModal(): Locator {
    return this.page.getByTestId('delete-confirmation-modal-content')
  }

  get confirmDeleteButton(): Locator {
    return this.page.getByTestId('confirm-delete')
  }

  get closeModalButton(): Locator {
    return this.page.getByTestId('modal-close')
  }

  // Breadcrumbs
  get breadcrumbsLink(): Locator {
    return this.page.getByRole('link', { name: 'Tapahtumat' })
  }

  async openDeleteModal() {
    await this.deleteButton.click()
  }

  async closeDeleteModal() {
    await this.closeModalButton.click()
  }

  async getOgMetaTag(property: string): Promise<string | null> {
    return this.page.locator(`meta[property="${property}"]`).getAttribute('content')
  }
}
