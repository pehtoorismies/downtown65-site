import { APIErrorResponseSchema } from '@downtown65/schema'
import { createRoute, z } from '@hono/zod-openapi'
import type { AppAPI } from '~/app-api'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'
import { getUserByNickname } from '../db/get-user-by-nickname'
import { DetailedUserAPIResponseSchema } from './api-schema'

// import { getUserByNickname } from '../db/get-user-by-nic

const route = createRoute({
  description: "Get user's information by nickname",
  method: 'get',
  middleware: [apiKeyAuth, jwtToken()],
  path: '/users/{nickname}',
  request: {
    params: z.object({
      nickname: z.string().min(1).openapi({ example: 'ada' }),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: DetailedUserAPIResponseSchema,
        },
      },
      description: 'User information',
    },
    404: {
      content: {
        'application/json': { schema: APIErrorResponseSchema },
      },
      description: 'User not found',
    },
    // 422: {
    //   $ref: '#/components/responses/ValidationError',
    // },
  },
  security: [{ ApiKeyAuth: [], BearerToken: [] }],
})

export const register = (app: AppAPI) => {
  app.openapi(route, async (c) => {
    const ctx = c.get('requestContext')
    const { nickname } = c.req.valid('param')
    const user = await getUserByNickname(ctx, nickname)

    if (!user) {
      return c.json({ code: 404, message: 'User not found' }, 404)
    }
    return c.json(user, 200)
  })
}
