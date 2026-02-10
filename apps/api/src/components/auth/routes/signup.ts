import { Auth0SubSchema, IDSchema } from '@downtown65/schema'
import { createRoute } from '@hono/zod-openapi'
import z from 'zod'
import type { AppAPI } from '~/app-api'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { signup } from '../db/signup'
import { RegisterParamSchema } from '../shared-schema'

const route = createRoute({
  method: 'post',
  middleware: [apiKeyAuth],
  path: '/auth/signup',
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
      content: {
        'application/json': {
          schema: z.object({
            auth0Sub: Auth0SubSchema,
            email: z.email(),
            id: IDSchema,
            nickname: z.string(),
          }),
        },
      },
      description: 'User registered successfully',
    },
    // 401: {
    //   $ref: '#/components/responses/UnauthorizedError',
    // },
    409: {
      content: {
        'application/json': {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
      description: 'User already exists',
    },
    429: {
      content: {
        'application/json': {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
      description: 'Too many requests',
    },
    500: {
      content: {
        'application/json': {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
      description: 'Internal server error',
    },
    // 422: {
    //   $ref: '#/components/responses/ValidationError',
    // },
  },
  security: [{ ApiKeyAuth: [] }],
})

export const register = (app: AppAPI) => {
  app.openapi(route, async (c) => {
    const ctx = c.get('requestContext')

    const input = c.req.valid('json')

    ctx.logger.withMetadata(input).debug('Signup attempt')
    if (input.registerSecret !== ctx.registerSecret) {
      return c.json({ error: 'Access denied' }, 409)
    }

    const result = await signup(ctx, {
      email: input.email,
      name: input.name,
      nickname: input.nickname,
      password: input.password,
    })

    switch (result.type) {
      case 'Error': {
        if (result.statusCode === 409) {
          return c.json({ error: result.error }, 409)
        }

        if (result.statusCode === 429) {
          ctx.logger
            .withMetadata(result)
            .info('Signup error 429 Too Many Requests')
          return c.json({ error: result.error }, 429)
        }
        ctx.logger
          .withMetadata(result)
          .error('Signup error 500 Internal Server Error')
        return c.json({ error: result.error }, 500)
      }

      case 'Success': {
        return c.json(result.user, 201)
      }
    }
  })
}
