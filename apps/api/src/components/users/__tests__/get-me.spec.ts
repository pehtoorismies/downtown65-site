import { env as testEnv } from 'cloudflare:test'
import { beforeEach, describe, expect, it } from 'vitest'
import { clearDatabase, createTestUser } from '~/common/test/db-helpers'
import {
  createMockUserService,
  mockState,
  resetMockUserService,
  setUserServiceError,
} from '~/common/test/mock-user-service'
import { authenticatedRequest } from '~/common/test/request-helpers'
import { getDb } from '~/db/get-db'
import { createApp } from '~/server'

const mockUserService = createMockUserService()
const app = createApp({ userService: mockUserService })

describe('GET /users/me', () => {
  const db = getDb(testEnv.D1_DB)

  beforeEach(async () => {
    await clearDatabase(db)
    resetMockUserService()
  })

  it('returns the authenticated user with local user existing', async () => {
    await createTestUser(db, {
      auth0Sub: 'auth0|user-123',
      nickname: 'test-user',
    })

    const res = await authenticatedRequest(app, testEnv, '/users/me', 'GET')

    expect(res.status).toBe(200)
    const user = await res.json()
    expect(user).toMatchObject({
      email: 'test@example.com',
      id: expect.any(Number),
      name: 'Test User',
      nickname: 'test-user',
      subscriptions: {
        eventCreationEmail: true,
        weeklyEmail: true,
      },
    })
  })

  it('returns 500 when user not found in service', async () => {
    // JWT mock uses sub 'auth0|user-123' — remove it from mock service
    mockState.reset()

    await createTestUser(db, {
      auth0Sub: 'auth0|user-123',
      nickname: 'test-user',
    })

    const res = await authenticatedRequest(app, testEnv, '/users/me', 'GET')

    expect(res.status).toBe(500)
  })

  it('returns 500 when user not found in local database', async () => {
    // Mock service has default user (auth0|user-123) but no local DB user
    const res = await authenticatedRequest(app, testEnv, '/users/me', 'GET')

    expect(res.status).toBe(500)
  })

  it('returns 500 when user service fails', async () => {
    // Create local user so the parallel DB query resolves quickly
    // and doesn't leak past the test boundary
    await createTestUser(db, {
      auth0Sub: 'auth0|user-123',
      nickname: 'test-user',
    })

    setUserServiceError('getBySub', {
      message: 'Service unavailable',
      statusCode: 503,
    })

    const res = await authenticatedRequest(app, testEnv, '/users/me', 'GET')
    // Consume body to ensure all in-flight operations settle
    await res.text()

    expect(res.status).toBe(500)
  })

  describe('authentication requirements', () => {
    it('returns 401 when API key is missing', async () => {
      const res = await app.request('/users/me', { method: 'GET' }, testEnv)

      expect(res.status).toBe(401)
    })

    it('returns 401 when JWT token is missing', async () => {
      const res = await app.request(
        '/users/me',
        {
          headers: { 'x-api-key': testEnv.API_KEY },
          method: 'GET',
        },
        testEnv,
      )

      expect(res.status).toBe(401)
    })
  })
})
