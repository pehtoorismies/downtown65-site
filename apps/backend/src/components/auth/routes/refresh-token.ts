import { createRoute } from '@hono/zod-openapi'
import z from 'zod'
import type { AppAPI } from '~/app-api'
import { getConfig } from '~/common/config/config'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { refreshToken } from '../db/refresh-token'
import { RefreshTokenParamSchema } from '../shared-schema'

const route = createRoute({
  method: 'post',
  path: '/auth/refresh-token',
  security: [{ ApiKeyAuth: [] }],
  middleware: [apiKeyAuth],
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
      description: 'Token refreshed successfully',
      content: {
        'application/json': {
          schema: z.object({
            accessToken: z.string(),
            idToken: z.string(),
          }),
        },
      },
    },
    // 401: {
    //   $ref: '#/components/responses/UnauthorizedError',
    // },
    // 422: {
    //   $ref: '#/components/responses/ValidationError',
    // },
  },
})

export const register = (app: AppAPI) => {
  app.openapi(route, async (c) => {
    const { refreshToken: refreshTokenValue } = c.req.valid('json')

    const refreshedTokens = await refreshToken(getConfig(c.env), {
      refreshToken: refreshTokenValue,
    })

    return c.json(refreshedTokens, 200)
  })
}
