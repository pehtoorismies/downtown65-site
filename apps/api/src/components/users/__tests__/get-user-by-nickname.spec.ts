import { env as testEnv } from 'cloudflare:test'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  addAuth0User,
  resetAuth0Mock,
  setAuth0Error,
} from '~/common/test/auth0-fixtures'
import { clearDatabase, createTestUser } from '~/common/test/db-helpers'
import { authenticatedRequest } from '~/common/test/request-helpers'
import { getDb } from '~/db/get-db'
import app from '~/server'

describe('GET /users/{nickname}', () => {
  const db = getDb(testEnv.D1_DB)

  beforeEach(async () => {
    await clearDatabase(db)
    resetAuth0Mock()
  })

  it('returns user by nickname', async () => {
    // Create matching Auth0 and local users
    addAuth0User({
      email: 'found@example.com',
      name: 'Found User',
      nickname: 'found-user',
      user_id: 'auth0|found-user',
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
    // The default Auth0 mock user has nickname 'test-user'
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

  it('returns 404 when user not found in Auth0', async () => {
    const res = await authenticatedRequest(
      app,
      testEnv,
      '/users/nonexistent',
      'GET',
    )

    expect(res.status).toBe(404)
  })

  it('returns 500 when Auth0 user exists but no local user', async () => {
    // Auth0 user exists but no local user record
    addAuth0User({
      nickname: 'orphan-user',
      user_id: 'auth0|orphan-user',
    })

    const res = await authenticatedRequest(
      app,
      testEnv,
      '/users/orphan-user',
      'GET',
    )

    // Per the implementation, this throws an error
    expect(res.status).toBe(500)
  })

  it('returns 500 when Auth0 API fails', async () => {
    setAuth0Error('list', {
      message: 'Auth0 unavailable',
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
