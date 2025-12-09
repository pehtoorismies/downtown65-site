import { createRoute } from '@hono/zod-openapi'
import z from 'zod'
import type { AppAPI } from '~/app-api'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { RegisterParamSchema } from '../shared-schema'

const route = createRoute({
  method: 'post',
  path: '/auth/register',
  security: [{ ApiKeyAuth: [] }],
  middleware: [apiKeyAuth],
  request: {
    body: {
      content: {
        'application/json': {
          schema: RegisterParamSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'User registered successfully',
      content: {
        'application/json': {
          schema: z.object({
            accessToken: z.string(),
            refreshToken: z.string(),
            user: z.object({
              id: z.string(),
              email: z.string(),
              name: z.string(),
            }),
          }),
        },
      },
    },
    // 401: {
    //   $ref: '#/components/responses/UnauthorizedError',
    // },
    403: {
      description: 'Access denied',
      content: {
        'application/json': {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },
    // 422: {
    //   $ref: '#/components/responses/ValidationError',
    // },
  },
})

export const register = (app: AppAPI) => {
  app.openapi(route, async (c) => {
    const { email, name, registerSecret } = c.req.valid('json')

    if (registerSecret !== c.env.REGISTER_SECRET) {
      return c.json({ error: 'Access denied' }, 403)
    }

    // TODO: Implement registration logic
    // - Hash password
    // - Create user
    // - Generate tokens

    return c.json(
      {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: {
          id: '1',
          email,
          name,
        },
      },
      201,
    )
  })
}
