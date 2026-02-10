import { createRoute } from '@hono/zod-openapi'
import z from 'zod'
import type { AppAPI } from '~/app-api'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { syncUsers } from '../db/sync-users'

const route = createRoute({
  description: 'Sync all users with external auth provider',
  method: 'post',
  middleware: [apiKeyAuth],
  path: '/sync/users',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            createdUsers: z.int(),
            existingUsers: z.int(),
          }),
        },
      },
      description: 'User updated successfully',
    },
  },
  security: [{ ApiKeyAuth: [] }],
})

export const register = (app: AppAPI) => {
  app.openapi(route, async (c) => {
    const ctx = c.get('requestContext')
    const updated = await syncUsers(ctx)

    return c.json(updated, 200)
  })
}
