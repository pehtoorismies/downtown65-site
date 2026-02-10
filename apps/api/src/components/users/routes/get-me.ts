import { createRoute } from '@hono/zod-openapi'
import type { AppAPI } from '~/app-api'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'
import { getUser } from '../db/get-user'
import { DetailedUserAPIResponseSchema } from './api-schema'

const route = createRoute({
  description: "Get the authenticated user's information",
  method: 'get',
  middleware: [apiKeyAuth, jwtToken()],
  path: '/users/me',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: DetailedUserAPIResponseSchema,
        },
      },
      description: 'User information',
    },
  },
  security: [{ ApiKeyAuth: [], BearerToken: [] }],
})

export const register = (app: AppAPI) => {
  app.openapi(route, async (c) => {
    const ctx = c.get('requestContext')
    const { sub } = c.get('jwtPayload')
    const user = await getUser(ctx, sub)

    return c.json(user, 200)
  })
}
