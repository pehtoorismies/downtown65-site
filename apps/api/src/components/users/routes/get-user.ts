import { APIErrorResponseSchema } from '@downtown65/schema'
import { createRoute, z } from '@hono/zod-openapi'
import type { AppAPI } from '~/app-api'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'
import { getUserIdByNickname } from '../db/get-user-id-by-nickname'
import { DetailedUserAPIResponseSchema } from './api-response-schema'

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
    500: {
      content: {
        'application/json': { schema: APIErrorResponseSchema },
      },
      description: 'Internal server error',
    },
  },
  security: [{ ApiKeyAuth: [], BearerToken: [] }],
})

export const register = (app: AppAPI) => {
  app.openapi(route, async (c) => {
    const ctx = c.get('requestContext')
    const { nickname } = c.req.valid('param')

    const [userResult, userIdResult] = await Promise.allSettled([
      ctx.userService.getByNickname(nickname),
      getUserIdByNickname(ctx, nickname),
    ])

    if (userResult.status === 'rejected') {
      throw userResult.reason
    }
    if (userIdResult.status === 'rejected') {
      throw userIdResult.reason
    }

    const user = userResult.value
    const userId = userIdResult.value

    if (!user) {
      return c.json({ code: 404, message: 'User not found' }, 404)
    }
    if (!userId) {
      return c.json(
        { code: 500, message: 'User not found in the database' },
        500,
      )
    }

    const body = DetailedUserAPIResponseSchema.parse({
      ...user,
      id: userId,
    })

    return c.json(body, 200)
  })
}
