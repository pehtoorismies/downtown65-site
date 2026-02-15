import { env as testEnv } from 'cloudflare:test'
import { beforeEach, describe, expect, it } from 'vitest'
import { clearDatabase, createTestUser } from '~/common/test/db-helpers'
import {
  addUser,
  createMockUserService,
  resetMockUserService,
  setUserServiceError,
} from '~/common/test/mock-user-service'
import { authenticatedRequest } from '~/common/test/request-helpers'
import { getDb } from '~/db/get-db'
import { createApp } from '~/server'

const mockUserService = createMockUserService()
const app = createApp({ userService: mockUserService })

describe('GET /users/{nickname}', () => {
  const db = getDb(testEnv.D1_DB)

  beforeEach(async () => {
    await clearDatabase(db)
    resetMockUserService()
  })

  it('returns user by nickname', async () => {
    addUser({
      email: 'found@example.com',
      name: 'Found User',
      nickname: 'found-user',
      sub: 'auth0|found-user',
    })

    await createTestUser(db, {
      auth0Sub: 'auth0|found-user',
      nickname: 'found-user',
    })

    const res = await authenticatedRequest(
      app,
      testEnv,
      '/users/found-user',
      'GET',
    )

    expect(res.status).toBe(200)
    const user = await res.json()
    expect(user).toMatchObject({
      email: 'found@example.com',
      id: expect.any(Number),
      name: 'Found User',
      nickname: 'found-user',
    })
  })

  it('returns the default test user by nickname', async () => {
    await createTestUser(db, {
      auth0Sub: 'auth0|user-123',
      nickname: 'test-user',
    })

    const res = await authenticatedRequest(
      app,
      testEnv,
      '/users/test-user',
      'GET',
    )

    expect(res.status).toBe(200)
    const user = await res.json<{ nickname: string; email: string }>()
    expect(user.nickname).toBe('test-user')
    expect(user.email).toBe('test@example.com')
  })

  it('returns 404 when user not found in service', async () => {
    const res = await authenticatedRequest(
      app,
      testEnv,
      '/users/nonexistent',
      'GET',
    )

    expect(res.status).toBe(404)
  })

  it('returns 500 when service user exists but no local user', async () => {
    addUser({
      nickname: 'orphan-user',
      sub: 'auth0|orphan-user',
    })

    const res = await authenticatedRequest(
      app,
      testEnv,
      '/users/orphan-user',
      'GET',
    )

    expect(res.status).toBe(500)
  })

  it('returns 500 when user service fails', async () => {
    // Create local user so the parallel DB query resolves quickly
    // and doesn't leak past the test boundary
    await createTestUser(db, {
      auth0Sub: 'auth0|any-user',
      nickname: 'any-user',
    })

    setUserServiceError('getByNickname', {
      message: 'Service unavailable',
      statusCode: 503,
    })

    const res = await authenticatedRequest(
      app,
      testEnv,
      '/users/any-user',
      'GET',
    )

    expect(res.status).toBe(500)
  })

  describe('authentication requirements', () => {
    it('returns 401 when API key is missing', async () => {
      const res = await app.request(
        '/users/some-user',
        { method: 'GET' },
        testEnv,
      )

      expect(res.status).toBe(401)
    })

    it('returns 401 when JWT token is missing', async () => {
      const res = await app.request(
        '/users/some-user',
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
