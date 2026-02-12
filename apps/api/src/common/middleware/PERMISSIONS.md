# Permissions Middleware

The `permissions` middleware provides permission-based access control for API routes. It validates that authenticated users have the required permissions in their JWT token before allowing access to protected endpoints.

## Overview

The middleware checks the `permissions` field in the JWT payload and returns a 403 Forbidden response if the user lacks any of the required permissions.

## Usage

### Basic Example

```typescript
import { createRoute } from '@hono/zod-openapi'
import type { AppAPI } from '~/app-api'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'
import { permissions } from '~/common/middleware/permissions'

const route = createRoute({
  method: 'post',
  path: '/users',
  // Add permissions middleware after jwtToken
  middleware: [apiKeyAuth, jwtToken(), permissions(['users:create', 'users:write'])],
  security: [{ ApiKeyAuth: [], BearerToken: [] }],
  responses: {
    201: {
      content: {
        'application/json': { schema: UserSchema },
      },
      description: 'User created',
    },
    403: {
      description: 'Forbidden: Insufficient permissions',
    },
  },
})

export const register = (app: AppAPI) => {
  app.openapi(route, async (c) => {
    // User has both 'users:create' and 'users:write' permissions
    const userData = c.req.valid('json')
    // ... implementation
  })
}
```

### Multiple Routes with Different Permissions

```typescript
// Read-only route - requires only read permission
const readRoute = createRoute({
  method: 'get',
  path: '/events',
  middleware: [apiKeyAuth, jwtToken(), permissions(['events:read'])],
  // ...
})

// Write route - requires both read and write permissions
const writeRoute = createRoute({
  method: 'post',
  path: '/events',
  middleware: [apiKeyAuth, jwtToken(), permissions(['events:read', 'events:write'])],
  // ...
})

// Admin route - requires admin permission
const adminRoute = createRoute({
  method: 'delete',
  path: '/events/:id',
  middleware: [apiKeyAuth, jwtToken(), permissions(['events:delete', 'admin:events'])],
  // ...
})
```

## Permission Format

Permissions follow the format: `resource:action`

Common examples:
- `users:read` - Read user data
- `users:write` - Create or update users
- `users:delete` - Delete users
- `events:read` - Read events
- `events:create` - Create events
- `events:write` - Update events
- `events:delete` - Delete events
- `me:read` - Read own profile
- `me:write` - Update own profile

## JWT Payload Structure

The middleware expects the JWT token to contain a `permissions` field:

```typescript
{
  sub: "auth0|user-123",
  email: "user@example.com",
  permissions: ["users:read", "users:write", "events:read"],
  // ... other JWT fields
}
```

## Error Responses

### 401 Unauthorized
Returned when JWT token is missing or invalid (handled by `jwtToken` middleware).

### 403 Forbidden
Returned when the user lacks required permissions. The response includes:
- `error`: "Forbidden"
- `message`: "Insufficient permissions"
- `required`: Array of all required permissions
- `missing`: Array of permissions the user is missing

Example response:
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions",
  "required": ["users:write", "events:create"],
  "missing": ["events:create"]
}
```

## Best Practices

1. **Always use after jwtToken middleware**: The permissions middleware requires the JWT payload to be available.

   ```typescript
   // ✅ Correct order
   middleware: [apiKeyAuth, jwtToken(), permissions(['users:read'])]
   
   // ❌ Wrong order - will fail
   middleware: [apiKeyAuth, permissions(['users:read']), jwtToken()]
   ```

2. **Use granular permissions**: Define specific permissions for different actions rather than broad permissions.

   ```typescript
   // ✅ Good - granular permissions
   permissions(['events:read'])
   permissions(['events:create'])
   permissions(['events:delete'])
   
   // ❌ Avoid - too broad
   permissions(['events:*'])
   ```

3. **Combine related permissions**: If an action requires multiple permissions, list them all.

   ```typescript
   // Create and notify requires both permissions
   permissions(['events:create', 'notifications:send'])
   ```

4. **Document required permissions**: Add OpenAPI documentation for permission requirements.

   ```typescript
   const route = createRoute({
     description: 'Create a new event. Requires: events:create, events:write',
     // ...
   })
   ```

## Testing

The middleware includes comprehensive tests covering:
- Valid permissions scenarios
- Missing permissions scenarios
- No permissions in JWT
- Edge cases (empty arrays, case sensitivity, special characters)

Run tests:
```bash
pnpm --filter api test permissions.spec.ts
```

## Implementation Details

The middleware:
1. Retrieves the JWT payload from the Hono context
2. Extracts the `permissions` array from the payload (defaults to empty array if not present)
3. Checks if all required permissions are present in the user's permissions
4. Returns 403 with detailed error if any permission is missing
5. Calls `next()` if all permissions are satisfied
