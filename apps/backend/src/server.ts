import { OpenAPIHono, z } from '@hono/zod-openapi'
import { Scalar } from '@scalar/hono-api-reference'
import { cors } from 'hono/cors'
import type { SchemaObject } from 'openapi3-ts/oas31'
import type { AppAPI } from './app-api'
import { registerRoutes as authRoutes } from './components/auth/routes'
import { registerRoutes as eventRoutes } from './components/events/routes'
import { registerRoutes as usersRoutes } from './components/users/routes'
import { UnauthorizedErrorSchema } from './schemas/unauthorized -error'
import { formatZodErrors, ValidationErrorSchema } from './schemas/validation-error'

const app: AppAPI = new OpenAPIHono({
  defaultHook: (result, c) => {
    if (!result.success) {
      return c.json(
        {
          message: 'Validation failed',
          errors: formatZodErrors(result.error),
        },
        422,
      )
    }
  },
})

app.openAPIRegistry.registerComponent(
  'schemas',
  'ValidationError',
  z.toJSONSchema(ValidationErrorSchema) as SchemaObject,
)

app.openAPIRegistry.registerComponent('responses', 'ValidationError', {
  description: 'Validation error',
  content: {
    'application/json': {
      schema: {
        $ref: '#/components/schemas/ValidationError',
      },
    },
  },
})

app.openAPIRegistry.registerComponent(
  'schemas',
  'UnauthorizedError',
  z.toJSONSchema(UnauthorizedErrorSchema) as SchemaObject,
)
app.openAPIRegistry.registerComponent('responses', 'UnauthorizedError', {
  description: 'Unauthorized Error',
  content: {
    'application/json': {
      schema: {
        $ref: '#/components/schemas/UnauthorizedError',
      },
    },
  },
})

app.openAPIRegistry.registerComponent('securitySchemes', 'ApiKeyAuth', {
  type: 'apiKey',
  in: 'header',
  name: 'x-api-key',
  description: 'API key required in the x-api-key header.',
})

app.openAPIRegistry.registerComponent('securitySchemes', 'BearerToken', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT', // optional, e.g. 'JWT'
})

app.use('*', cors())

app.get('/healthz', (c) => c.json({ status: 'ok' }))

eventRoutes(app)
authRoutes(app)
usersRoutes(app)

app.doc31('/doc', {
  openapi: '3.1.0',
  info: {
    title: 'Event API',
    version: '1.0.0',
  },
  security: [{ ApiKeyAuth: [] }],
})

app.get(
  '/scalar',
  Scalar(() => ({
    url: '/doc',
    theme: 'kepler',
    authentication: {
      // Make your API key scheme the default selection
      preferredSecurityScheme: 'ApiKeyAuth',
      securitySchemes: {
        ApiKeyAuth: {
          name: 'x-api-key', // header name in your security scheme
          in: 'header',
          value: 'dev-api-key-change-in-production', // provide a default value for easy testing
        },
      },
    },
  })),
)

// Export for Cloudflare Workers
export default app
