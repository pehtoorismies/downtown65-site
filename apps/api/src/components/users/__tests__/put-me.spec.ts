import { env as testEnv } from 'cloudflare:test'
import { eq } from 'drizzle-orm'
import { beforeEach, describe, expect, it } from 'vitest'
import { clearDatabase, createTestUser } from '~/common/test/db-helpers'
import {
  createMockUserService,
  resetMockUserService,
} from '~/common/test/mock-user-service'
import { authenticatedRequest } from '~/common/test/request-helpers'
import { getDb } from '~/db/get-db'
import { users as usersTable } from '~/db/schema'
import { createApp } from '~/server'

const mockUserService = createMockUserService()
const app = createApp({ userService: mockUserService })

describe('PUT /users/me', () => {
  const db = getDb(testEnv.D1_DB)

  beforeEach(async () => {
    await clearDatabase(db)
    resetMockUserService()
  })

  it('updates user nickname in local database', async () => {
    const localUser = await createTestUser(db, {
      nickname: 'old-nickname',
      sub: 'auth0|user-123',
    })

    const res = await authenticatedRequest(app, testEnv, '/users/me', 'PUT', {
      nickname: 'new-nickname',
    })

    expect(res.status).toBe(200)
    const body = await res.json<{ message: string }>()
    expect(body.message).toBe('User updated successfully')

    const [updated] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, localUser.id))

    expect(updated.nickname).toBe('new-nickname')
  })

  it('updates picture in local database', async () => {
    const localUser = await createTestUser(db, {
      picture: 'https://example.com/old-avatar.jpg',
      sub: 'auth0|user-123',
    })

    const newPicture = 'https://example.com/new-avatar.jpg'
    const res = await authenticatedRequest(app, testEnv, '/users/me', 'PUT', {
      picture: newPicture,
    })

    expect(res.status).toBe(200)

    const [updated] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, localUser.id))

    expect(updated.picture).toBe(newPicture)
  })

  it('returns 200 when updating name (not stored locally)', async () => {
    await createTestUser(db, {
      nickname: 'test-user',
      sub: 'auth0|user-123',
    })

    const res = await authenticatedRequest(app, testEnv, '/users/me', 'PUT', {
      name: 'Updated Name',
    })

    expect(res.status).toBe(200)
    const body = await res.json<{ message: string }>()
    expect(body.message).toBe('User updated successfully')
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
