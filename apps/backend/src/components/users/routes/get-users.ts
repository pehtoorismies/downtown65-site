import { createRoute } from '@hono/zod-openapi'
import z from 'zod'
import type { AppAPI } from '~/app-api'
import { getAuthConfigFromEnv } from '~/common/auth0/auth-config'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'
import { listUsers } from '../db/list-users'
import { PaginationQuerySchema } from '../shared-schema'
import { UserAPIResponseSchema } from './api-schema'

const route = createRoute({
  method: 'get',
  path: '/users',
  description: 'Get all users',
  security: [{ ApiKeyAuth: [], BearerToken: [] }],
  middleware: [apiKeyAuth, jwtToken()],
  request: {
    query: PaginationQuerySchema,
  },
  responses: {
    200: {
      description: 'List of all users',
      content: {
        'application/json': {
          schema: z.object({
            users: z.array(UserAPIResponseSchema.omit({ id: true })),
            total: z.number(),
            start: z.number(),
            limit: z.number(),
            length: z.number(),
          }),
        },
      },
    },
    // 401: {
    //   $ref: '#/components/responses/UnauthorizedError',
    // },
  },
})

export const register = (app: AppAPI) => {
  app.openapi(route, async (c) => {
    const { page, limit } = c.req.valid('query')
    const authConfig = getAuthConfigFromEnv(c.env)

    const paginatedUsers = await listUsers(authConfig, { page, limit })

    return c.json(paginatedUsers, 200)
  })
}
