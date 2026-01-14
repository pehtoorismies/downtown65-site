import { APIErrorResponseSchema } from '@downtown65/schema'
import { createRoute, z } from '@hono/zod-openapi'
import type { AppAPI } from '~/app-api'
import { getConfig } from '~/common/config/config'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'
import { getUserByNickname } from '../db/get-user-by-nickname'
import { DetailedUserAPIResponseSchema } from './api-schema'

// import { getUserByNickname } from '../db/get-user-by-nic

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
          schema: DetailedUserAPIResponseSchema,
        },
      },
    },
    404: {
      description: 'User not found',
      content: {
        'application/json': { schema: APIErrorResponseSchema },
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
    const user = await getUserByNickname(getConfig(c.env), nickname)

    if (!user) {
      return c.json({ message: 'User not found', code: 404 }, 404)
    }
    return c.json(user, 200)
  })
}
