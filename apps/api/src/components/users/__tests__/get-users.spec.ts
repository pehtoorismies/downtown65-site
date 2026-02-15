import { env as testEnv } from 'cloudflare:test'
import { beforeEach, describe, expect, it } from 'vitest'
import { clearDatabase } from '~/common/test/db-helpers'
import {
  createMockUserService,
  mockState,
  resetMockUserService,
  seedUsers,
  setUserServiceError,
} from '~/common/test/mock-user-service'
import { authenticatedRequest } from '~/common/test/request-helpers'
import { getDb } from '~/db/get-db'
import { createApp } from '~/server'

const mockUserService = createMockUserService()
const app = createApp({ userService: mockUserService })

interface UsersResponse {
  length: number
  limit: number
  start: number
  total: number
  users: Array<{
    nickname: string
    name: string
    email: string
  }>
}

describe('GET /users', () => {
  const db = getDb(testEnv.D1_DB)

  beforeEach(async () => {
    await clearDatabase(db)
    resetMockUserService()
  })

  it('returns paginated list of users', async () => {
    seedUsers(15)

    const res = await authenticatedRequest(
      app,
      testEnv,
      '/users?page=1&limit=10',
      'GET',
    )

    expect(res.status).toBe(200)
    const data = await res.json<UsersResponse>()
    expect(data.users).toHaveLength(10)
    expect(data.total).toBe(16) // 15 seeded + 1 default
    expect(data.limit).toBe(10)
    expect(data.start).toBe(0)
  })

  it('returns second page of users', async () => {
    seedUsers(15)

    const res = await authenticatedRequest(
      app,
      testEnv,
      '/users?page=2&limit=10',
      'GET',
    )

    expect(res.status).toBe(200)
    const data = await res.json<UsersResponse>()
    expect(data.users).toHaveLength(6) // Remaining users
    expect(data.start).toBe(10)
  })

  it('uses default pagination when not specified', async () => {
    seedUsers(5)

    const res = await authenticatedRequest(app, testEnv, '/users', 'GET')

    expect(res.status).toBe(200)
    const data = await res.json<UsersResponse>()
    expect(data.limit).toBe(10)
    expect(data.users).toHaveLength(6) // 5 seeded + 1 default
  })

  it('returns empty users array when no users exist', async () => {
    mockState.reset()

    const res = await authenticatedRequest(app, testEnv, '/users', 'GET')

    expect(res.status).toBe(200)
    const data = await res.json<UsersResponse>()
    expect(data.users).toHaveLength(0)
    expect(data.total).toBe(0)
  })

  it('returns user data with correct structure', async () => {
    const res = await authenticatedRequest(app, testEnv, '/users', 'GET')

    expect(res.status).toBe(200)
    const data = await res.json<UsersResponse>()
    expect(data.users).toHaveLength(1)

    const user = data.users[0]
    expect(user).toMatchObject({
      email: expect.any(String),
      name: expect.any(String),
      nickname: expect.any(String),
    })
  })

  it('returns 500 when user service fails', async () => {
    setUserServiceError('paginatedList', {
      message: 'Service temporarily unavailable',
      statusCode: 503,
    })

    const res = await authenticatedRequest(app, testEnv, '/users', 'GET')

    expect(res.status).toBe(500)
  })

  describe('authentication requirements', () => {
    it('returns 401 when API key is missing', async () => {
      const res = await app.request('/users', { method: 'GET' }, testEnv)

      expect(res.status).toBe(401)
    })

    it('returns 401 when JWT token is missing', async () => {
      const res = await app.request(
        '/users',
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
