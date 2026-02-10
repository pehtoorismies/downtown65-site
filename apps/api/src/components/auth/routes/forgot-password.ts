import { MessageSchema } from '@downtown65/schema'
import { createRoute } from '@hono/zod-openapi'
import type { AppAPI } from '~/app-api'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { forgotPassword } from '../db/forgot-password'
import { ForgotPasswordParamSchema } from '../shared-schema'

const route = createRoute({
  method: 'post',
  middleware: [apiKeyAuth],
  path: '/auth/forgot-password',
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
      content: {
        'application/json': {
          schema: MessageSchema,
        },
      },
      description: 'Password reset email sent',
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
    const { email } = c.req.valid('json')
    await forgotPassword(ctx, { email })

    return c.json({ message: 'Password reset email sent' })
  })
}
