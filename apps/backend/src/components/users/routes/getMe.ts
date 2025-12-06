import { createRoute } from '@hono/zod-openapi'
import { z } from 'zod/mini'
import type { AppAPI } from '~/app-api'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'
import { createUsersStore } from '../store'
import {
  type DetailedUserResponse,
  DetailedUserResponseSchema,
  RESTDetailedUserSchema,
} from './schema'

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
          schema: DetailedUserResponseSchema,
        },
      },
    },
  },
})

export const register = (app: AppAPI) => {
  app.openapi(route, async (c) => {
    const { sub } = c.get('jwtPayload')
    const store = createUsersStore(c.env)
    const user = await store.getUser(sub)
    const response = RESTDetailedUserSchema.parse(user)
    return c.json(response, 200)
  })
}
