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
    const logger = createLogger({ requestId: c.var.requestId })

    const { email, name, registerSecret, password, nickname } = c.req.valid('json')
    logger.info({ email, nickname }, 'Signup attempt')
    if (registerSecret !== c.env.REGISTER_SECRET) {
      return c.json({ error: 'Access denied' }, 409)
    }

    const result = await signup(getConfig(c.env), { email, name, password, nickname })

    switch (result.type) {
      case 'Error': {
        logger.info(result, 'Signup error')
        if (result.statusCode === 409) {
          return c.json({ error: result.error }, 409)
        }
        if (result.statusCode === 429) {
          return c.json({ error: result.error }, 429)
        }
        return c.json({ error: result.error }, 500)
      }

      case 'Success': {
        return c.json(result.user, 201)
      }
    }
  })
}
