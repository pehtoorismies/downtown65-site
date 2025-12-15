import { Auth0SubSchema, IDSchema } from '@downtown65/schema'
import { createRoute } from '@hono/zod-openapi'
import z from 'zod'
import type { AppAPI } from '~/app-api'
import { getConfig } from '~/common/config/config'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { ErrorAPIResponseSchema } from '~/common/schema'
import { login } from '../db/login'
import { LoginParamSchema } from '../shared-schema'

const route = createRoute({
  method: 'post',
  path: '/auth/login',
  security: [{ ApiKeyAuth: [] }],
  middleware: [apiKeyAuth],
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
      description: 'Login successful',
      content: {
        'application/json': {
          schema: z.object({
            accessToken: z.string(),
            refreshToken: z.string(),
            idToken: z.string(),
            expiresIn: z.number(),
            user: z.object({
              id: IDSchema,
              auth0Sub: Auth0SubSchema,
              email: z.email(),
              name: z.string(),
              nickname: z.string(),
              picture: z.string(),
            }),
          }),
        },
      },
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorAPIResponseSchema,
        },
      },
      description: 'Returns an error',
    },
    // 401: {
    //   $ref: '#/components/responses/UnauthorizedError',
    // },
    403: {
      description: 'Access denied',
      content: {
        'application/json': {
          schema: ErrorAPIResponseSchema,
        },
      },
    },
    // 422: {
    //   $ref: '#/components/responses/ValidationError',
    // },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: ErrorAPIResponseSchema,
        },
      },
    },
  },
})

export const register = (app: AppAPI) => {
  app.openapi(route, async (c) => {
    const { email, password } = c.req.valid('json')

    const response = await login(getConfig(c.env), { email, password })

    switch (response.type) {
      case 'InvalidCredentials':
        return c.json({ message: response.error, code: 401 }, 401)
      case 'AccessDenied':
        return c.json({ message: response.error, code: 403 }, 403)
      case 'UnknownError':
        return c.json({ message: response.error, code: 500 }, 500)
      case 'Success': {
        return c.json(
          {
            accessToken: response.tokens.accessToken,
            refreshToken: response.tokens.refreshToken,
            idToken: response.tokens.idToken,
            expiresIn: response.tokens.expiresIn,
            user: response.user,
          },
          200,
        )
      }
    }
  })
}
