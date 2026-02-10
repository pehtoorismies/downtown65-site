import { createRoute } from '@hono/zod-openapi'
import z from 'zod'
import type { AppAPI } from '~/app-api'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { refreshToken } from '../db/refresh-token'
import { RefreshTokenParamSchema } from '../shared-schema'

const route = createRoute({
  method: 'post',
  middleware: [apiKeyAuth],
  path: '/auth/refresh-token',
  request: {
    body: {
      content: {
        'application/json': {
          schema: RefreshTokenParamSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            accessToken: z.string(),
            idToken: z.string(),
          }),
        },
      },
      description: 'Token refreshed successfully',
    },
    // 401: {
    //   $ref: '#/components/responses/UnauthorizedError',
    // },
    // 422: {
    //   $ref: '#/components/responses/ValidationError',
    // },
  },
  security: [{ ApiKeyAuth: [] }],
})

export const register = (app: AppAPI) => {
  app.openapi(route, async (c) => {
    const ctx = c.get('requestContext')
    const { refreshToken: refreshTokenValue } = c.req.valid('json')

    const refreshedTokens = await refreshToken(ctx, {
      refreshToken: refreshTokenValue,
    })

    return c.json(refreshedTokens, 200)
  })
}
