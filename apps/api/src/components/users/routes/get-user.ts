import { APIErrorResponseSchema } from '@downtown65/schema'
import { createRoute, z } from '@hono/zod-openapi'
import type { AppAPI } from '~/app-api'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'
import { getUserIdByNickname } from '../db/get-user-id-by-nickname'
import { UserAPIResponseSchema } from './user-api-response-schema'

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
          schema: UserAPIResponseSchema,
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

    const saasUser = userResult.value
    const user = userIdResult.value

    if (!saasUser && !user) {
      return c.json(
        {
          code: 404,
          message: `User with ${nickname} not found`,
        },
        404,
      )
    }

    if (!saasUser) {
      return c.json(
        {
          code: 500,
          message: `User with ${nickname} not found in the Auth0 SaasUserService`,
        },
        500,
      )
    }
    if (!user) {
      return c.json(
        {
          code: 500,
          message: `User with ${nickname} not found in the local database`,
        },
        500,
      )
    }

    const body = UserAPIResponseSchema.parse({
      ...saasUser,
      id: user.id,
    })

    return c.json(body, 200)
  })
}
