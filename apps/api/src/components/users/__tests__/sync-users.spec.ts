import { env as testEnv } from 'cloudflare:test'
import { beforeEach, describe, expect, it } from 'vitest'
import { clearDatabase, createTestUser } from '~/common/test/db-helpers'
import {
  createMockUserService,
  mockState,
  resetMockUserService,
  seedUsers,
  setUserServiceError,
} from '~/common/test/mock-user-service'
import { makeRequest } from '~/common/test/request-helpers'
import { getDb } from '~/db/get-db'
import { createApp } from '~/server'

const mockUserService = createMockUserService()
const app = createApp({ userService: mockUserService })

interface SyncResponse {
  createdUsers: number
  existingUsers: number
}

describe('POST /sync/users', () => {
  const db = getDb(testEnv.D1_DB)

  beforeEach(async () => {
    await clearDatabase(db)
    resetMockUserService()
  })

  it('syncs users to local database', async () => {
    seedUsers(3)

    const res = await makeRequest(app, testEnv, '/sync/users', {
      headers: {
        'x-api-key': testEnv.API_KEY || 'test-api-key',
      },
      method: 'POST',
    })

    expect(res.status).toBe(200)
    const body = await res.json<SyncResponse>()
    expect(body.createdUsers).toBe(4) // 3 seeded + 1 default
    expect(body.existingUsers).toBe(0)

    // Verify users were created in local database
    const localUsers = await db.query.users.findMany()
    expect(localUsers).toHaveLength(4)
  })

  it('skips users that already exist locally', async () => {
    const seeded = seedUsers(3)

    // Create one user locally first
    await createTestUser(db, {
      nickname: seeded[0].nickname,
      sub: seeded[0].sub,
    })

    const res = await makeRequest(app, testEnv, '/sync/users', {
      headers: {
        'x-api-key': testEnv.API_KEY || 'test-api-key',
      },
      method: 'POST',
    })

    expect(res.status).toBe(200)
    const body = await res.json<SyncResponse>()
    expect(body.createdUsers).toBe(3) // 2 seeded + 1 default (skipped 1 existing)
    expect(body.existingUsers).toBe(1)

    // Verify total users in local database
    const localUsers = await db.query.users.findMany()
    expect(localUsers).toHaveLength(4)
  })

  it('skips all users when all exist locally', async () => {
    // Create the default user locally
    await createTestUser(db, {
      nickname: 'test-user',
      sub: 'auth0|user-123',
    })

    const res = await makeRequest(app, testEnv, '/sync/users', {
      headers: {
        'x-api-key': testEnv.API_KEY || 'test-api-key',
      },
      method: 'POST',
    })

    expect(res.status).toBe(200)
    const body = await res.json<SyncResponse>()
    expect(body.createdUsers).toBe(0)
    expect(body.existingUsers).toBe(1) // Default user
  })

  it('handles empty users list', async () => {
    mockState.reset()

    const res = await makeRequest(app, testEnv, '/sync/users', {
      headers: {
        'x-api-key': testEnv.API_KEY || 'test-api-key',
      },
      method: 'POST',
    })

    expect(res.status).toBe(200)
    const body = await res.json<SyncResponse>()
    expect(body.createdUsers).toBe(0)
    expect(body.existingUsers).toBe(0)
  })

  it('returns 500 when user service fails', async () => {
    setUserServiceError('paginatedList', {
      message: 'Service unavailable',
      statusCode: 500,
    })

    const res = await makeRequest(app, testEnv, '/sync/users', {
      headers: {
        'x-api-key': testEnv.API_KEY || 'test-api-key',
      },
      method: 'POST',
    })

    expect(res.status).toBe(500)
  })

  describe('authentication requirements', () => {
    it('returns 401 when API key is missing', async () => {
      const res = await app.request('/sync/users', { method: 'POST' }, testEnv)

      expect(res.status).toBe(401)
    })

    it('does not require JWT token (API key only)', async () => {
      const res = await makeRequest(app, testEnv, '/sync/users', {
        headers: {
          'x-api-key': testEnv.API_KEY || 'test-api-key',
        },
        method: 'POST',
      })

      expect(res.status).toBe(200)
    })
  })
})
