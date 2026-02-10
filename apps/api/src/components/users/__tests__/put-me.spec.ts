import { env as testEnv } from 'cloudflare:test'
import { eq } from 'drizzle-orm'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  getAuth0MockUser,
  resetAuth0Mock,
  setAuth0Error,
} from '~/common/test/auth0-fixtures'
import { clearDatabase, createTestUser } from '~/common/test/db-helpers'
import { authenticatedRequest } from '~/common/test/request-helpers'
import { getDb } from '~/db/get-db'
import { users as usersTable } from '~/db/schema'
import app from '~/server'

describe('PUT /users/me', () => {
  const db = getDb(testEnv.D1_DB)

  beforeEach(async () => {
    await clearDatabase(db)
    resetAuth0Mock()
  })

  it('updates user name in Auth0', async () => {
    await createTestUser(db, {
      auth0Sub: 'auth0|user-123',
      nickname: 'test-user',
    })

    const res = await authenticatedRequest(app, testEnv, '/users/me', 'PUT', {
      name: 'Updated Name',
    })

    expect(res.status).toBe(200)
    const body = await res.json<{ message: string }>()
    expect(body.message).toBe('User updated successfully')

    // Verify the Auth0 mock was updated
    const updatedUser = getAuth0MockUser('auth0|user-123')
    expect(updatedUser?.name).toBe('Updated Name')
  })

  it('updates nickname and syncs to local database', async () => {
    const localUser = await createTestUser(db, {
      auth0Sub: 'auth0|user-123',
      nickname: 'old-nickname',
    })

    const res = await authenticatedRequest(app, testEnv, '/users/me', 'PUT', {
      nickname: 'new-nickname',
    })

    expect(res.status).toBe(200)

    // Verify local user was updated
    const [updated] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, localUser.id))

    expect(updated.nickname).toBe('new-nickname')

    // Verify Auth0 mock was updated
    const auth0User = getAuth0MockUser('auth0|user-123')
    expect(auth0User?.nickname).toBe('new-nickname')
  })

  it('updates picture and syncs to local database', async () => {
    const localUser = await createTestUser(db, {
      auth0Sub: 'auth0|user-123',
      picture: 'https://example.com/old-avatar.jpg',
    })

    const newPicture = 'https://example.com/new-avatar.jpg'
    const res = await authenticatedRequest(app, testEnv, '/users/me', 'PUT', {
      picture: newPicture,
    })

    expect(res.status).toBe(200)

    // Verify local user was updated
    const [updated] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, localUser.id))

    expect(updated.picture).toBe(newPicture)
  })

  it('updates email preferences (user_metadata)', async () => {
    await createTestUser(db, {
      auth0Sub: 'auth0|user-123',
    })

    const res = await authenticatedRequest(app, testEnv, '/users/me', 'PUT', {
      subscribeEventCreationEmail: false,
      subscribeWeeklyEmail: false,
    })

    expect(res.status).toBe(200)

    // Verify Auth0 mock was updated with user_metadata
    const updatedUser = getAuth0MockUser('auth0|user-123')
    expect(updatedUser?.user_metadata).toEqual({
      subscribeEventCreationEmail: false,
      subscribeWeeklyEmail: false,
    })
  })

  it('returns 500 when Auth0 update fails', async () => {
    await createTestUser(db, {
      auth0Sub: 'auth0|user-123',
    })

    setAuth0Error('update', {
      message: 'Failed to update user',
      statusCode: 500,
    })

    const res = await authenticatedRequest(app, testEnv, '/users/me', 'PUT', {
      name: 'New Name',
    })

    expect(res.status).toBe(500)
  })

  describe('authentication requirements', () => {
    it('returns 401 when API key is missing', async () => {
      const res = await app.request(
        '/users/me',
        {
          body: JSON.stringify({ name: 'Test' }),
          headers: { 'Content-Type': 'application/json' },
          method: 'PUT',
        },
        testEnv,
      )

      expect(res.status).toBe(401)
    })

    it('returns 401 when JWT token is missing', async () => {
      const res = await app.request(
        '/users/me',
        {
          body: JSON.stringify({ name: 'Test' }),
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': testEnv.API_KEY,
          },
          method: 'PUT',
        },
        testEnv,
      )

      expect(res.status).toBe(401)
    })
  })
})
