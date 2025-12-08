import { createRoute } from '@hono/zod-openapi'
import z from 'zod'
import type { AppAPI } from '~/app-api'
import { getAuthConfigFromEnv } from '~/common/auth0/auth-config'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { forgotPassword } from '../db/forgot-password'
import { ForgotPasswordParamSchema } from '../shared-schema'

const route = createRoute({
  method: 'post',
  path: '/auth/forgot-password',
  security: [{ ApiKeyAuth: [] }],
  middleware: [apiKeyAuth],
  request: {
    body: {
      content: {
        'application/json': {
          schema: ForgotPasswordParamSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Password reset email sent',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
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
    const { email } = c.req.valid('json')
    const authConfig = getAuthConfigFromEnv(c.env)
    await forgotPassword(authConfig, { email })

    return c.json({ message: 'Password reset email sent' })
  })
}
