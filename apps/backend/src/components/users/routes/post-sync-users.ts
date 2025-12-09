import { createRoute } from '@hono/zod-openapi'
import z from 'zod'
import type { AppAPI } from '~/app-api'
import { getAuthConfigFromEnv } from '~/common/auth0/auth-config'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'
import { syncUsers } from '../db/sync-users'
import { SyncedUsersResponseSchema } from './api-schema'

const route = createRoute({
  method: 'post',
  path: '/sync/users',
  description: 'Sync all users with external auth provider',
  security: [{ ApiKeyAuth: [], BearerToken: [] }],
  middleware: [apiKeyAuth, jwtToken()],
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
    const authConfig = getAuthConfigFromEnv(c.env)

    const updated = await syncUsers(authConfig, c.env.D1_DB)

    return c.json(updated, 200)
  })
}
