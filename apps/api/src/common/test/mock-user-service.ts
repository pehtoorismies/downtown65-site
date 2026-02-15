import { ISODateTimeSchema } from '@downtown65/schema'
import type {
  SaasUser,
  SaasUserService,
} from '~/common/services/saas-user-service'

type ErrorConfig = {
  method: 'getBySub' | 'getByNickname' | 'paginatedList' | 'update'
  statusCode: number
  message: string
}

export const mockState = {
  errors: {
    getByNickname: null as { statusCode: number; message: string } | null,
    getBySub: null as { statusCode: number; message: string } | null,
    paginatedList: null as { statusCode: number; message: string } | null,
    update: null as { statusCode: number; message: string } | null,
  },
  reset() {
    this.users.clear()
    this.errors.getBySub = null
    this.errors.getByNickname = null
    this.errors.paginatedList = null
    this.errors.update = null
  },
  users: new Map<string, SaasUser>(),
}

function throwIfError(method: ErrorConfig['method']) {
  const error = mockState.errors[method]
  if (error) {
    const err = new Error(error.message) as Error & { statusCode: number }
    err.statusCode = error.statusCode
    throw err
  }
}

export function createMockUser(overrides: Partial<SaasUser> = {}): SaasUser {
  const timestamp = Date.now()
  const now = ISODateTimeSchema.parse(new Date().toISOString())

  return {
    createdAt: now,
    email: `user-${timestamp}@example.com`,
    name: `Test User ${timestamp}`,
    nickname: `testuser-${timestamp}`,
    picture: `https://example.com/avatar-${timestamp}.jpg`,
    sub: `auth0|mock-${timestamp}`,
    subscriptions: {
      eventCreationEmail: true,
      weeklyEmail: true,
    },
    updatedAt: now,
    ...overrides,
  }
}

export function createDefaultTestUser(): SaasUser {
  return createMockUser({
    email: 'test@example.com',
    name: 'Test User',
    nickname: 'test-user',
    sub: 'auth0|user-123',
  })
}

export function seedUsers(count: number): SaasUser[] {
  const users: SaasUser[] = []
  for (let i = 0; i < count; i++) {
    const user = createMockUser({
      email: `seeded-${i}@example.com`,
      name: `Seeded User ${i}`,
      nickname: `seeded-user-${i}`,
      sub: `auth0|seeded-user-${i}`,
    })
    mockState.users.set(user.sub, user)
    users.push(user)
  }
  return users
}

export function addUser(overrides: Partial<SaasUser> = {}): SaasUser {
  const user = createMockUser(overrides)
  mockState.users.set(user.sub, user)
  return user
}

export function resetMockUserService() {
  mockState.reset()
  const defaultUser = createDefaultTestUser()
  mockState.users.set(defaultUser.sub, defaultUser)
}

export function getMockUser(sub: string): SaasUser | undefined {
  return mockState.users.get(sub)
}

export function getAllMockUsers(): SaasUser[] {
  return Array.from(mockState.users.values())
}

export function setUserServiceError(
  method: ErrorConfig['method'],
  error: { statusCode: number; message: string },
) {
  mockState.errors[method] = error
}

export function clearUserServiceError(method: ErrorConfig['method']) {
  mockState.errors[method] = null
}

export function createMockUserService(): SaasUserService {
  return {
    getBySub: async (sub) => {
      throwIfError('getBySub')
      return mockState.users.get(sub) ?? null
    },

    paginatedList: async (page, limit) => {
      throwIfError('paginatedList')
      const adjustedPage = page > 0 ? page - 1 : 0
      const adjustedLimit = limit > 0 ? limit : 1
      const allUsers = Array.from(mockState.users.values())
      const start = adjustedPage * adjustedLimit
      const paginatedUsers = allUsers.slice(start, start + adjustedLimit)

      return {
        length: paginatedUsers.length,
        limit: adjustedLimit,
        start,
        total: allUsers.length,
        users: paginatedUsers,
      }
    },

    update: async (sub, params) => {
      throwIfError('update')
      const user = mockState.users.get(sub)
      if (!user) {
        throw new Error(`User not found: ${sub}`)
      }

      const updated: SaasUser = {
        ...user,
        ...(params.nickname !== undefined && { nickname: params.nickname }),
        ...(params.name !== undefined && { name: params.name }),
        ...(params.picture !== undefined && { picture: params.picture }),
        subscriptions: {
          eventCreationEmail:
            params.subscriptions.eventCreationEmail ??
            user.subscriptions.eventCreationEmail,
          weeklyEmail:
            params.subscriptions.weeklyEmail ?? user.subscriptions.weeklyEmail,
        },
        updatedAt: ISODateTimeSchema.parse(new Date().toISOString()),
      }

      mockState.users.set(sub, updated)
    },
  }
}
