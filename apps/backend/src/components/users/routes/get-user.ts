import { createRoute } from '@hono/zod-openapi'
import { z } from 'zod'
import type { AppAPI } from '~/app-api'
import { getAuthConfigFromEnv } from '~/common/auth0/auth-config'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'
import { ErrorAPIResponseSchema } from '~/common/schema'
import { getUserByNickname } from '../db/get-user-by-nickname'
import { DetailedUserAPIResponseSchema } from './api-schema'

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
        'application/json': { schema: ErrorAPIResponseSchema },
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
    const authConfig = getAuthConfigFromEnv(c.env)
    const user = await getUserByNickname(authConfig, nickname)

    if (!user) {
      return c.json({ message: 'User not found', code: 404 }, 404)
    }
    return c.json(user, 200)
  })
}
