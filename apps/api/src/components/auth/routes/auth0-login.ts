import { APIErrorResponseSchema } from '@downtown65/schema'
import { createRoute } from '@hono/zod-openapi'
import z from 'zod'
import type { AppAPI } from '~/app-api'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { auth0Login } from '../db/auth0-login'
import { LoginParamSchema } from '../shared-schema'

const route = createRoute({
  method: 'post',
  middleware: [apiKeyAuth],
  path: '/auth/auth0login',
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
            idToken: z.string(),
            refreshToken: z.string(),
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
    const { email, password } = c.req.valid('json')

    const response = await auth0Login(c.get('requestContext'), {
      email,
      password,
    })

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
            idToken: response.tokens.idToken,
            refreshToken: response.tokens.refreshToken,
          },
          200,
        )
      }
    }
  })
}
