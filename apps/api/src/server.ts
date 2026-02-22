import { createLogger } from '@downtown65/logger'
import { MessageSchema } from '@downtown65/schema'
import { OpenAPIHono, z } from '@hono/zod-openapi'
import { Scalar } from '@scalar/hono-api-reference'
import { cors } from 'hono/cors'
import { requestId } from 'hono/request-id'
import type { SchemaObject } from 'openapi3-ts/oas31'
import { createAuth0UserService } from '~/common/services/auth0-service'
import type { SaasUserService } from '~/common/services/saas-user-service'
import type { AppAPI } from './app-api'
import { ConfigSchema } from './common/config/config'
import { registerRoutes as authRoutes } from './components/auth/routes'
import { registerRoutes as eventRoutes } from './components/events/routes'
import { registerRoutes as usersRoutes } from './components/users/routes'
import {
  formatZodErrors,
  ValidationErrorSchema,
} from './schemas/validation-error'

interface AppServices {
  userService?: SaasUserService
}

export function createApp(services: AppServices = {}) {
  const app: AppAPI = new OpenAPIHono({
    defaultHook: (result, c) => {
      if (result.success === false) {
        c.get('requestContext')
          .logger.withMetadata({
            errors: result.error,
          })
          .warn('Validation failed')
        return c.json(
          {
            errors: formatZodErrors(result.error),
            message: 'Validation failed',
          },
          422,
        )
      }
    },
  })

  app.use(requestId())

  app.use('*', async (c, next) => {
    const configResult = ConfigSchema.safeParse(c.env)

    if (!configResult.success) {
      console.error('Invalid configuration:', configResult.error.issues)
      return c.json(
        {
          message: 'Configuration is invalid. Please see logs for details.',
        },
        500,
      )
    }
    const config = configResult.data

    const logger = createLogger({
      appContext: 'API',
      level: config.logLevel,
    })

    c.set('requestContext', {
      ...config,
      logger,
      userService:
        services.userService ?? createAuth0UserService(config.authConfig),
    })
    await next()
  })

  app.use('*', cors())

  app.openAPIRegistry.registerComponent(
    'schemas',
    'ValidationError',
    z.toJSONSchema(ValidationErrorSchema) as SchemaObject,
  )

  app.openAPIRegistry.registerComponent('responses', 'ValidationError', {
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/ValidationError',
        },
      },
    },
    description: 'Validation error',
  })

  app.openAPIRegistry.registerComponent(
    'schemas',
    'UnauthorizedError',
    z.toJSONSchema(MessageSchema) as SchemaObject,
  )
  app.openAPIRegistry.registerComponent('responses', 'UnauthorizedError', {
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/UnauthorizedError',
        },
      },
    },
    description: 'Unauthorized Error',
  })

  app.openAPIRegistry.registerComponent('securitySchemes', 'ApiKeyAuth', {
    description: 'API key required in the x-api-key header.',
    in: 'header',
    name: 'x-api-key',
    type: 'apiKey',
  })

  app.openAPIRegistry.registerComponent('securitySchemes', 'BearerToken', {
    bearerFormat: 'JWT', // optional, e.g. 'JWT'
    scheme: 'bearer',
    type: 'http',
  })

  app.get('/healthz', (c) => c.json({ status: 'ok' }))

  authRoutes(app)
  eventRoutes(app)
  usersRoutes(app)

  app.doc31('/doc', {
    info: {
      title: 'Event API',
      version: '1.0.0',
    },
    openapi: '3.1.0',
    security: [{ ApiKeyAuth: [] }],
  })

  app.get(
    '/scalar',
    Scalar(() => ({
      authentication: {
        // Make your API key scheme the default selection
        preferredSecurityScheme: 'ApiKeyAuth',
        securitySchemes: {
          ApiKeyAuth: {
            in: 'header',
            name: 'x-api-key', // header name in your security scheme
            value: 'api', // provide a default value for easy testing
          },
        },
      },
      pageTitle: 'Dt65 Events API Reference',
      theme: 'kepler' as const,
      url: '/doc',
    })),
  )

  return app
}

// Export for Cloudflare Workers
export default createApp()
