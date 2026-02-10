import { expect, test } from '@playwright/test'
import { EventPage } from './page-objects/event-page'

test.describe('Event detail page - Anonymous user', () => {
  let eventPage: EventPage
  let eventULID: string

  test.beforeEach(async ({ page }) => {
    eventPage = new EventPage(page)

    // Navigate to events list and get first event ULID
    await page.goto('/events')
    const firstEventLink = page.locator('a[href^="/events/"]').first()
    const href = await firstEventLink.getAttribute('href')
    eventULID = href?.split('/').pop() ?? ''

    await eventPage.goto(eventULID)
  })

  test('displays event details', async () => {
    await expect(eventPage.title).toBeVisible()
    await expect(eventPage.subtitle).toBeVisible()
    await expect(eventPage.date).toBeVisible()
    await expect(eventPage.location).toBeVisible()
    await expect(eventPage.eventType).toBeVisible()
    await expect(eventPage.createdBy).toBeVisible()
  })

  test('shows login button instead of join/leave', async () => {
    await expect(eventPage.loginButton).toBeVisible()
    await expect(eventPage.participateButton).not.toBeVisible()
    await expect(eventPage.leaveButton).not.toBeVisible()
  })

  test('displays breadcrumbs correctly', async () => {
    await expect(eventPage.breadcrumbsLink).toBeVisible()
    await expect(eventPage.breadcrumbsLink).toHaveAttribute('href', '/events')
  })

  test('does not show edit and delete buttons for anonymous users', async () => {
    await expect(eventPage.modifyButton).not.toBeVisible()
    await expect(eventPage.deleteButton).not.toBeVisible()
  })
})

test.describe('Event detail page - Authenticated user', () => {
  test.use({ storageState: 'playwright/.auth/user.json' })

  let eventPage: EventPage
  let eventULID: string

  test.beforeEach(async ({ page }) => {
    eventPage = new EventPage(page)

    // Navigate to events list and get first event ULID
    await page.goto('/events')
    const firstEventLink = page.locator('a[href^="/events/"]').first()
    const href = await firstEventLink.getAttribute('href')
    eventULID = href?.split('/').pop() ?? ''

    await eventPage.goto(eventULID)
  })

  test('displays event details', async () => {
    await expect(eventPage.title).toBeVisible()
    await expect(eventPage.subtitle).toBeVisible()
    await expect(eventPage.date).toBeVisible()
    await expect(eventPage.location).toBeVisible()
    await expect(eventPage.eventType).toBeVisible()
    await expect(eventPage.createdBy).toBeVisible()
  })

  test('shows participate or leave button', async () => {
    await expect(eventPage.loginButton).not.toBeVisible()

    // User is either participating or not - check which button is visible
    const participateVisible = await eventPage.participateButton.isVisible()
    const leaveVisible = await eventPage.leaveButton.isVisible()

    expect(participateVisible || leaveVisible).toBe(true)
  })

  test('shows edit and delete buttons', async () => {
    await expect(eventPage.modifyButton).toBeVisible()
    await expect(eventPage.deleteButton).toBeVisible()
  })

  test('can open and close delete modal', async () => {
    await eventPage.openDeleteModal()
    await expect(eventPage.deleteModal).toBeVisible()
    await expect(eventPage.confirmDeleteButton).toBeDisabled()

    await eventPage.closeDeleteModal()
    await expect(eventPage.deleteModal).not.toBeVisible()
  })

  test('has OG meta tags', async () => {
    const ogType = await eventPage.getOgMetaTag('og:type')
    const ogUrl = await eventPage.getOgMetaTag('og:url')
    const ogTitle = await eventPage.getOgMetaTag('og:title')
    const ogDescription = await eventPage.getOgMetaTag('og:description')
    const ogImage = await eventPage.getOgMetaTag('og:image')

    expect(ogType).toBe('website')
    expect(ogUrl).toContain(`/events/${eventULID}`)
    expect(ogTitle).toBeTruthy()
    expect(ogDescription).toBeTruthy()
    expect(ogImage).toBeTruthy()
  })
})
