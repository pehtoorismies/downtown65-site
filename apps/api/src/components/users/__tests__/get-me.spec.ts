import { env as testEnv } from 'cloudflare:test'
import { beforeEach, describe, expect, it } from 'vitest'
import { resetAuth0Mock, setAuth0Error } from '~/common/test/auth0-fixtures'
import { clearDatabase, createTestUser } from '~/common/test/db-helpers'
import { authenticatedRequest } from '~/common/test/request-helpers'
import { getDb } from '~/db/get-db'
import app from '~/server'

interface UserResponse {
  id: number
  nickname: string
  email: string
  name: string
  preferences: {
    subscribeEventCreationEmail: boolean
    subscribeWeeklyEmail: boolean
  }
  roles: string[]
}

describe('GET /users/me', () => {
  const db = getDb(testEnv.D1_DB)

  beforeEach(async () => {
    await clearDatabase(db)
    resetAuth0Mock()
  })

  it('returns the authenticated user with local user existing', async () => {
    // Create local user matching the JWT mock sub (auth0|user-123)
    await createTestUser(db, {
      auth0Sub: 'auth0|user-123',
      nickname: 'test-user',
    })

    const res = await authenticatedRequest(app, testEnv, '/users/me', 'GET')

    expect(res.status).toBe(200)
    const user = await res.json<UserResponse>()
    expect(user).toMatchObject({
      email: 'test@example.com',
      name: 'Test User',
      nickname: 'test-user',
      preferences: {
        subscribeEventCreationEmail: true,
        subscribeWeeklyEmail: true,
      },
      roles: ['USER'],
    })
    expect(user.id).toEqual(expect.any(Number))
  })

  it('creates local user if only exists in Auth0', async () => {
    // Auth0 mock has default user (auth0|user-123), but no local user

    const res = await authenticatedRequest(app, testEnv, '/users/me', 'GET')

    expect(res.status).toBe(200)
    const user = await res.json<UserResponse>()
    expect(user.id).toEqual(expect.any(Number))
    expect(user.nickname).toBe('test-user')

    // Verify user was created in local database
    const localUsers = await db.query.users.findMany()
    expect(localUsers).toHaveLength(1)
    expect(localUsers[0].auth0Sub).toBe('auth0|user-123')
  })

  it('returns 500 when Auth0 API fails', async () => {
    setAuth0Error('get', {
      message: 'Auth0 service unavailable',
      statusCode: 503,
    })

    const res = await authenticatedRequest(app, testEnv, '/users/me', 'GET')

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
