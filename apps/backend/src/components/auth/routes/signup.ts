import { createLogger } from '@downtown65/logger'
import { createRoute } from '@hono/zod-openapi'
import z from 'zod'
import type { AppAPI } from '~/app-api'
import { getConfig } from '~/common/config/config'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { Auth0SubSchema, IDSchema } from '~/common/schema'
import { signup } from '../db/signup'
import { RegisterParamSchema } from '../shared-schema'

const route = createRoute({
  method: 'post',
  path: '/auth/signup',
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
            id: IDSchema,
            auth0Sub: Auth0SubSchema,
            email: z.email(),
            nickname: z.string(),
          }),
        },
      },
    },
    // 401: {
    //   $ref: '#/components/responses/UnauthorizedError',
    // },
    409: {
      description: 'User already exists',
      content: {
        'application/json': {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },
    429: {
      description: 'Too many requests',
      content: {
        'application/json': {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },
    500: {
      description: 'Internal server error',
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
    const logger = createLogger({ prefix: 'backend' })

    const input = c.req.valid('json')

    logger.withMetadata(input).debug('Signup attempt')
    if (input.registerSecret !== c.env.REGISTER_SECRET) {
      return c.json({ error: 'Access denied' }, 409)
    }

    const result = await signup(getConfig(c.env), {
      email: input.email,
      name: input.name,
      password: input.password,
      nickname: input.nickname,
    })

    switch (result.type) {
      case 'Error': {
        if (result.statusCode === 409) {
          return c.json({ error: result.error }, 409)
        }

        if (result.statusCode === 429) {
          logger.withMetadata(result).info('Signup error 429 Too Many Requests')
          return c.json({ error: result.error }, 429)
        }
        logger
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
