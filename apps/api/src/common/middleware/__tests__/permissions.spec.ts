import type { Context } from 'hono'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { permissions } from '../permissions'

// Mock context with json method
const createMockContext = (
  jwtPayload?: {
    permissions?: string[]
    sub: string
  },
  jsonResponse?: { status: number; body: unknown },
) => {
  const jsonFn = vi.fn((body: unknown, status: number) => {
    if (jsonResponse) {
      jsonResponse.status = status
      jsonResponse.body = body
    }
    return { body, status }
  })

  const context = {
    get: vi.fn((key: string) => {
      if (key === 'jwtPayload') return jwtPayload
      return undefined
    }),
    json: jsonFn,
    set: vi.fn(),
  } as unknown as Context

  return { context, jsonFn }
}

describe('Permissions Middleware', () => {
  let next: ReturnType<typeof vi.fn>

  beforeEach(() => {
    next = vi.fn()
  })

  describe('with valid permissions', () => {
    it('allows access when user has all required permissions', async () => {
      const { context } = createMockContext({
        permissions: ['users:read', 'users:write', 'events:read'],
        sub: 'auth0|user-123',
      })

      const middleware = permissions(['users:read', 'users:write'])

      await middleware(context, next)

      expect(next).toHaveBeenCalledOnce()
    })

    it('allows access when required permissions array is empty', async () => {
      const { context } = createMockContext({
        permissions: [],
        sub: 'auth0|user-123',
      })

      const middleware = permissions([])

      await middleware(context, next)

      expect(next).toHaveBeenCalledOnce()
    })

    it('allows access when user has more permissions than required', async () => {
      const { context } = createMockContext({
        permissions: [
          'users:read',
          'users:write',
          'events:read',
          'events:create',
        ],
        sub: 'auth0|user-123',
      })

      const middleware = permissions(['users:read'])

      await middleware(context, next)

      expect(next).toHaveBeenCalledOnce()
    })
  })

  describe('with missing permissions', () => {
    it('returns 403 when user lacks all required permissions', async () => {
      const jsonResponse: { status: number; body: unknown } = {
        body: null,
        status: 0,
      }
      const { context, jsonFn } = createMockContext(
        {
          permissions: ['events:read'],
          sub: 'auth0|user-123',
        },
        jsonResponse,
      )

      const middleware = permissions(['users:read', 'users:write'])

      await middleware(context, next)

      expect(jsonFn).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Forbidden',
          message: 'Insufficient permissions',
        }),
        403,
      )
      expect(next).not.toHaveBeenCalled()
    })

    it('returns 403 when user lacks some required permissions', async () => {
      const jsonResponse: { status: number; body: unknown } = {
        body: null,
        status: 0,
      }
      const { context, jsonFn } = createMockContext(
        {
          permissions: ['users:read'],
          sub: 'auth0|user-123',
        },
        jsonResponse,
      )

      const middleware = permissions(['users:read', 'users:write'])

      await middleware(context, next)

      expect(jsonFn).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Forbidden',
        }),
        403,
      )
      expect(next).not.toHaveBeenCalled()
    })

    it('includes missing permissions in error message', async () => {
      const jsonResponse: { status: number; body: unknown } = {
        body: null,
        status: 0,
      }
      const { context, jsonFn } = createMockContext(
        {
          permissions: ['users:read'],
          sub: 'auth0|user-123',
        },
        jsonResponse,
      )

      const middleware = permissions(['users:read', 'users:write', 'me:write'])

      await middleware(context, next)

      expect(jsonFn).toHaveBeenCalledWith(
        {
          error: 'Forbidden',
          message: 'Insufficient permissions',
          missing: ['users:write', 'me:write'],
          required: ['users:read', 'users:write', 'me:write'],
        },
        403,
      )
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('with no permissions in JWT', () => {
    it('returns 403 when JWT has no permissions field', async () => {
      const jsonResponse: { status: number; body: unknown } = {
        body: null,
        status: 0,
      }
      const { context, jsonFn } = createMockContext(
        {
          sub: 'auth0|user-123',
          // No permissions field
        },
        jsonResponse,
      )

      const middleware = permissions(['users:read'])

      await middleware(context, next)

      expect(jsonFn).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Forbidden',
        }),
        403,
      )
      expect(next).not.toHaveBeenCalled()
    })

    it('allows access when no permissions required and JWT has no permissions', async () => {
      const { context } = createMockContext({
        sub: 'auth0|user-123',
        // No permissions field
      })

      const middleware = permissions([])

      await middleware(context, next)

      expect(next).toHaveBeenCalledOnce()
    })
  })

  describe('with no JWT payload', () => {
    it('returns 401 when JWT payload is missing', async () => {
      const jsonResponse: { status: number; body: unknown } = {
        body: null,
        status: 0,
      }
      const { context, jsonFn } = createMockContext(undefined, jsonResponse) // No JWT payload

      const middleware = permissions(['users:read'])

      await middleware(context, next)

      expect(jsonFn).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Unauthorized',
        }),
        401,
      )
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('handles empty permissions array in JWT', async () => {
      const jsonResponse: { status: number; body: unknown } = {
        body: null,
        status: 0,
      }
      const { context, jsonFn } = createMockContext(
        {
          permissions: [],
          sub: 'auth0|user-123',
        },
        jsonResponse,
      )

      const middleware = permissions(['users:read'])

      await middleware(context, next)

      expect(jsonFn).toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    it('handles case-sensitive permission matching', async () => {
      const jsonResponse: { status: number; body: unknown } = {
        body: null,
        status: 0,
      }
      const { context, jsonFn } = createMockContext(
        {
          permissions: ['Users:Read'], // Different case
          sub: 'auth0|user-123',
        },
        jsonResponse,
      )

      const middleware = permissions(['users:read'])

      await middleware(context, next)

      expect(jsonFn).toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    it('handles duplicate permissions in requirements', async () => {
      const { context } = createMockContext({
        permissions: ['users:read'],
        sub: 'auth0|user-123',
      })

      const middleware = permissions(['users:read', 'users:read'])

      await middleware(context, next)

      expect(next).toHaveBeenCalledOnce()
    })

    it('handles special characters in permission names', async () => {
      const { context } = createMockContext({
        permissions: ['api:v2:users:read', 'some-permission:write'],
        sub: 'auth0|user-123',
      })

      const middleware = permissions([
        'api:v2:users:read',
        'some-permission:write',
      ])

      await middleware(context, next)

      expect(next).toHaveBeenCalledOnce()
    })
  })
})
