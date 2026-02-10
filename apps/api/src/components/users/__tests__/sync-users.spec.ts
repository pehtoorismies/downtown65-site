import { env as testEnv } from 'cloudflare:test'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  getAllAuth0MockUsers,
  resetAuth0Mock,
  seedAuth0Users,
  setAuth0Error,
} from '~/common/test/auth0-fixtures'
import { clearDatabase, createTestUser } from '~/common/test/db-helpers'
import { makeRequest } from '~/common/test/request-helpers'
import { getDb } from '~/db/get-db'
import app from '~/server'

interface SyncResponse {
  createdUsers: number
  existingUsers: number
}

describe('POST /sync/users', () => {
  const db = getDb(testEnv.D1_DB)

  beforeEach(async () => {
    await clearDatabase(db)
    resetAuth0Mock()
  })

  it('syncs Auth0 users to local database', async () => {
    seedAuth0Users(3)

    // API key only route - no JWT needed
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
    const auth0Users = seedAuth0Users(3)

    // Create one user locally first
    await createTestUser(db, {
      auth0Sub: auth0Users[0].user_id,
      nickname: auth0Users[0].nickname,
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
    const auth0Users = getAllAuth0MockUsers()

    // Create all Auth0 users locally
    for (const auth0User of auth0Users) {
      await createTestUser(db, {
        auth0Sub: auth0User.user_id,
        nickname: auth0User.nickname,
      })
    }

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

  it('handles empty Auth0 users list', async () => {
    // Clear all Auth0 mock users
    const { auth0MockState } = await import('~/common/test/auth0-mock')
    auth0MockState.users.clear()

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

  it('returns 500 when Auth0 API fails', async () => {
    setAuth0Error('list', {
      message: 'Auth0 unavailable',
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
      // Only API key, no JWT - should still work
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
