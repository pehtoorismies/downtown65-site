import type { Context, Next } from 'hono'

/**
 * Creates middleware to check if the authenticated user has the required permissions.
 * This middleware should be used after jwtToken middleware to ensure JWT payload is available.
 *
 * @param requiredPermissions - Array of permissions that the user must have (e.g., ['users:read', 'users:write'])
 * @returns Middleware function that validates user permissions
 *
 * @example
 * ```typescript
 * const route = createRoute({
 *   middleware: [apiKeyAuth, jwtToken(), permissions(['users:read', 'users:write'])],
 *   // ... rest of route config
 * })
 * ```
 */
export const permissions =
  (requiredPermissions: string[]) => async (c: Context, next: Next) => {
    const jwtPayload = c.get('jwtPayload')

    // If no JWT payload exists, the JWT middleware should have already rejected the request
    if (!jwtPayload) {
      return c.json(
        {
          error: 'Unauthorized',
          message: 'No JWT payload found',
        },
        401,
      )
    }

    // Get permissions from JWT payload
    const userPermissions = jwtPayload.permissions || []

    // Check if user has all required permissions
    const hasAllPermissions = requiredPermissions.every((required) =>
      userPermissions.includes(required),
    )

    if (!hasAllPermissions) {
      const missingPermissions = requiredPermissions.filter(
        (required) => !userPermissions.includes(required),
      )

      return c.json(
        {
          error: 'Forbidden',
          message: 'Insufficient permissions',
          missing: missingPermissions,
          required: requiredPermissions,
        },
        403,
      )
    }

    await next()
  }
