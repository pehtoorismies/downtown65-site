import { APIErrorResponseSchema, UserSchema } from '@downtown65/schema'
import { createRoute } from '@hono/zod-openapi'
import z from 'zod'
import type { AppAPI } from '~/app-api'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { login } from '../db/login'
import { LoginParamSchema } from '../shared-schema'

const route = createRoute({
  method: 'post',
  middleware: [apiKeyAuth],
  path: '/auth/login',
  request: {
    body: {
      content: {
        'application/json': {
          schema: LoginParamSchema,
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
            expiresIn: z.number(),
            idToken: z.string(),
            refreshToken: z.string(),
            user: UserSchema,
          }),
        },
      },
      description: 'Login successful',
    },
    401: {
      content: {
        'application/json': {
          schema: APIErrorResponseSchema,
        },
      },
      description: 'Returns an error',
    },
    // 401: {
    //   $ref: '#/components/responses/UnauthorizedError',
    // },
    403: {
      content: {
        'application/json': {
          schema: APIErrorResponseSchema,
        },
      },
      description: 'Access denied',
    },
    // 422: {
    //   $ref: '#/components/responses/ValidationError',
    // },
    500: {
      content: {
        'application/json': {
          schema: APIErrorResponseSchema,
        },
      },
      description: 'Internal server error',
    },
  },
  security: [{ ApiKeyAuth: [] }],
})

export const register = (app: AppAPI) => {
  app.openapi(route, async (c) => {
    const ctx = c.get('requestContext')
    const logger = ctx.logger.child().withContext({ route: 'POST /auth/login' })
    logger.info('Login attempt')

    const { email, password } = c.req.valid('json')

    const response = await login(ctx, { email, password })
    if (response.type !== 'Success') {
      logger
        .withMetadata({ error: response.error })
        .warn('Login response error')
    }

    switch (response.type) {
      case 'InvalidCredentials':
        return c.json({ code: 401, message: response.error }, 401)
      case 'AccessDenied':
        return c.json({ code: 403, message: response.error }, 403)
      case 'UnknownError':
        return c.json({ code: 500, message: response.error }, 500)
      case 'Success': {
        return c.json(
          {
            accessToken: response.tokens.accessToken,
            expiresIn: response.tokens.expiresIn,
            idToken: response.tokens.idToken,
            refreshToken: response.tokens.refreshToken,
            user: response.user,
          },
          200,
        )
      }
    }
  })
}
