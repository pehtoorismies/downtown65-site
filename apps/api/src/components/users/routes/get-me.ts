import { APIErrorResponseSchema } from '@downtown65/schema'
import { createRoute } from '@hono/zod-openapi'
import type { AppAPI } from '~/app-api'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'
import { getUserId } from '../db/get-user-id'
import { DetailedUserAPIResponseSchema } from './api-response-schema'

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
    const { sub } = c.get('jwtPayload')

    const [userResult, userIdResult] = await Promise.allSettled([
      ctx.userService.getBySub(sub),
      getUserId(ctx, sub),
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
      return c.json(
        { code: 500, message: 'User not found in SaasUserService' },
        500,
      )
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
