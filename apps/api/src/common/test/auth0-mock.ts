import { vi } from 'vitest'

// Type definitions for mock responses
export interface MockAuth0User {
  user_id: string
  email: string
  name: string
  nickname: string
  picture: string
  created_at: string
  updated_at: string
  app_metadata: {
    role: string
  }
  user_metadata: {
    subscribeEventCreationEmail: boolean
    subscribeWeeklyEmail: boolean
  }
}

export interface MockAuth0Error {
  statusCode: number
  message: string
  error: string
}

// Mutable state object that tests can modify
export const auth0MockState = {
  // Error states - when set, the corresponding method throws
  errors: {
    create: null as MockAuth0Error | null,
    get: null as MockAuth0Error | null,
    list: null as MockAuth0Error | null,
    update: null as MockAuth0Error | null,
  },

  // Reset to defaults
  reset() {
    this.users.clear()
    this.errors.get = null
    this.errors.list = null
    this.errors.update = null
    this.errors.create = null
  },
  // Users database - keyed by user_id (auth0Sub)
  users: new Map<string, MockAuth0User>(),
}

// Helper to create a mock Auth0 user with defaults
export function createMockAuth0User(
  overrides: Partial<MockAuth0User> = {},
): MockAuth0User {
  const timestamp = Date.now()
  const defaultSub = `auth0|mock-${timestamp}`
  const now = new Date().toISOString()

  return {
    app_metadata: {
      role: 'USER',
    },
    created_at: now,
    email: `user-${timestamp}@example.com`,
    name: `Test User ${timestamp}`,
    nickname: `testuser-${timestamp}`,
    picture: `https://example.com/avatar-${timestamp}.jpg`,
    updated_at: now,
    user_id: defaultSub,
    user_metadata: {
      subscribeEventCreationEmail: true,
      subscribeWeeklyEmail: true,
    },
    ...overrides,
  }
}

// Create the default test user that matches jwk-mock.ts
export function createDefaultTestUser(): MockAuth0User {
  return createMockAuth0User({
    email: 'test@example.com',
    name: 'Test User',
    nickname: 'test-user',
    user_id: 'auth0|user-123',
  })
}

// Helper to create Auth0-style error
function createAuth0Error(
  statusCode: number,
  message: string,
): Error & {
  statusCode: number
  body: { message: string; statusCode: number }
} {
  const error = new Error(message) as Error & {
    statusCode: number
    body: {
      message: string
      statusCode: number
      error: string
      errorCode: string
    }
  }
  error.statusCode = statusCode
  error.body = {
    error: message,
    errorCode: `auth0_error_${statusCode}`,
    message,
    statusCode,
  }
  return error
}

// Mock the Auth0 client module
vi.mock('~/common/auth0/client', () => {
  const createMockUsersApi = () => ({
    create: vi.fn(
      async (data: {
        email: string
        password: string
        name: string
        nickname: string
        connection: string
        app_metadata?: { role: string }
        user_metadata?: {
          subscribeEventCreationEmail?: boolean
          subscribeWeeklyEmail?: boolean
        }
        email_verified?: boolean
        verify_email?: boolean
      }) => {
        if (auth0MockState.errors.create) {
          throw createAuth0Error(
            auth0MockState.errors.create.statusCode,
            auth0MockState.errors.create.message,
          )
        }

        // Check for duplicate email
        const existingUser = Array.from(auth0MockState.users.values()).find(
          (u) => u.email === data.email,
        )
        if (existingUser) {
          throw createAuth0Error(409, 'The user already exists.')
        }

        const newUser = createMockAuth0User({
          app_metadata: data.app_metadata || { role: 'USER' },
          email: data.email,
          name: data.name,
          nickname: data.nickname,
          user_metadata: {
            subscribeEventCreationEmail:
              data.user_metadata?.subscribeEventCreationEmail ?? true,
            subscribeWeeklyEmail:
              data.user_metadata?.subscribeWeeklyEmail ?? true,
          },
        })

        auth0MockState.users.set(newUser.user_id, newUser)
        return newUser
      },
    ),
    get: vi.fn(async (userId: string, _options?: { fields?: string }) => {
      if (auth0MockState.errors.get) {
        throw createAuth0Error(
          auth0MockState.errors.get.statusCode,
          auth0MockState.errors.get.message,
        )
      }

      const user = auth0MockState.users.get(userId)
      if (!user) {
        throw createAuth0Error(404, 'User not found')
      }
      return user
    }),

    list: vi.fn(
      async (params?: {
        q?: string
        page?: number
        per_page?: number
        include_totals?: boolean
        sort?: string
        fields?: string
      }) => {
        if (auth0MockState.errors.list) {
          throw createAuth0Error(
            auth0MockState.errors.list.statusCode,
            auth0MockState.errors.list.message,
          )
        }

        let users = Array.from(auth0MockState.users.values())

        // Handle nickname query filter (used by getUserByNickname)
        if (params?.q) {
          const nicknameMatch = params.q.match(/nickname:(.+)/)
          if (nicknameMatch) {
            const nickname = nicknameMatch[1]
            users = users.filter((u) => u.nickname === nickname)
          }
        }

        // Handle pagination
        const page = params?.page ?? 0
        const perPage = params?.per_page ?? 10
        const start = page * perPage
        const paginatedUsers = users.slice(start, start + perPage)

        return {
          data: paginatedUsers,
          response: {
            length: paginatedUsers.length,
            limit: perPage,
            start,
            total: users.length,
            users: paginatedUsers,
          },
        }
      },
    ),

    update: vi.fn(async (userId: string, data: Partial<MockAuth0User>) => {
      if (auth0MockState.errors.update) {
        throw createAuth0Error(
          auth0MockState.errors.update.statusCode,
          auth0MockState.errors.update.message,
        )
      }

      const user = auth0MockState.users.get(userId)
      if (!user) {
        throw createAuth0Error(404, 'User not found')
      }

      const updatedUser = {
        ...user,
        ...data,
        updated_at: new Date().toISOString(),
      }
      auth0MockState.users.set(userId, updatedUser)

      return updatedUser
    }),
  })

  return {
    createAuthClient: vi.fn(() => ({
      oauth: {
        clientCredentialsGrant: vi.fn(async () => ({
          data: { access_token: 'mock-access-token' },
        })),
      },
    })),
    getManagementClient: vi.fn(async () => ({
      users: createMockUsersApi(),
    })),
  }
})

// Initialize with default test user matching jwk-mock.ts
auth0MockState.users.set('auth0|user-123', createDefaultTestUser())
