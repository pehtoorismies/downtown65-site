import { createRoute } from '@hono/zod-openapi'
import type { AppAPI } from '~/app-api'
import { getConfig } from '~/common/config/config'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'
import { getUser } from '../db/get-user'
import { DetailedUserAPIResponseSchema } from './api-schema'

const route = createRoute({
  method: 'get',
  path: '/users/me',
  description: "Get the authenticated user's information",
  security: [{ ApiKeyAuth: [], BearerToken: [] }],
  middleware: [apiKeyAuth, jwtToken()],
  responses: {
    200: {
      description: 'User information',
      content: {
        'application/json': {
          schema: DetailedUserAPIResponseSchema,
        },
      },
    },
  },
})

export const register = (app: AppAPI) => {
  app.openapi(route, async (c) => {
    const { sub } = c.get('jwtPayload')
    const user = await getUser(getConfig(c.env), sub)

    return c.json(user, 200)
  })
}
