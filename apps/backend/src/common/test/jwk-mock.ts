import type { Context } from 'hono'
import { vi } from 'vitest'

const jwkMock = () => {
  type Next = () => Promise<Response>

  vi.mock('hono/jwk', () => ({
    jwk: (options: { allow_anon?: boolean }) => {
      console.log('JWK mock initialized with options:', options)
      return async (c: Context, next: Next) => {
        const authHeader = c.req.header('Authorization')

        // No auth header
        if (!authHeader) {
          if (options.allow_anon) {
            // Allow anonymous access
            await next()
            return
          }
          return c.json({ error: 'Missing Authorization header' }, 401)
        }

        // Has auth header - validate it
        const token = authHeader.replace('Bearer ', '')

        if (token === 'valid-token') {
          // Set JWT payload
          c.set('jwtPayload', {
            sub: 'user-123',
            email: 'test@example.com',
            name: 'Test User',
          })
          await next()
        } else if (token === 'expired-token') {
          return c.json({ error: 'Token expired' }, 401)
        } else {
          return c.json({ error: 'Invalid token' }, 401)
        }
      }
    },
  }))
}

export default jwkMock
