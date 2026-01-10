import { createRoute } from '@hono/zod-openapi'
import z from 'zod'
import type { AppAPI } from '~/app-api'
import { getConfig } from '~/common/config/config'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { syncUsers } from '../db/sync-users'
import { SyncedUsersResponseSchema } from './api-schema'

const route = createRoute({
  method: 'post',
  path: '/sync/users',
  description: 'Sync all users with external auth provider',
  security: [{ ApiKeyAuth: [] }],
  middleware: [apiKeyAuth],
  responses: {
    200: {
      description: 'User updated successfully',
      content: {
        'application/json': {
          schema: z.object({
            createdUsers: SyncedUsersResponseSchema,
            updatedUsers: SyncedUsersResponseSchema,
          }),
        },
      },
    },
  },
})

export const register = (app: AppAPI) => {
  app.openapi(route, async (c) => {
    const updated = await syncUsers(getConfig(c.env))

    return c.json(updated, 200)
  })
}
