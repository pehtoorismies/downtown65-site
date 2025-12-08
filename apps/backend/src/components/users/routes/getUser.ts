import { ErrorResponseSchema } from '@downtown65/schema'
import { createRoute } from '@hono/zod-openapi'
import { z } from 'zod'
import type { AppAPI } from '~/app-api'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'
import { createUsersStore } from '../store'
import { DetailedUserResponseSchema, RESTDetailedUserSchema } from './schema'

const route = createRoute({
  method: 'get',
  path: '/users/{nickname}',
  description: "Get user's information by nickname",
  security: [{ ApiKeyAuth: [], BearerToken: [] }],
  middleware: [apiKeyAuth, jwtToken()],
  request: {
    params: z.object({
      nickname: z.string().min(1).openapi({ example: 'ada' }),
    }),
  },
  responses: {
    200: {
      description: 'User information',
      content: {
        'application/json': {
          schema: DetailedUserResponseSchema,
        },
      },
    },
    404: {
      description: 'User not found',
      content: {
        'application/json': { schema: ErrorResponseSchema },
      },
    },
    // 422: {
    //   $ref: '#/components/responses/ValidationError',
    // },
  },
})

export const register = (app: AppAPI) => {
  app.openapi(route, async (c) => {
    const { nickname } = c.req.valid('param')
    const store = createUsersStore(c.env)
    const user = await store.getUserByNickname(nickname)

    if (!user) {
      return c.json({ message: 'User not found', code: 404 }, 404)
    }
    const response = RESTDetailedUserSchema.parse(user)
    return c.json(response, 200)
  })
}
