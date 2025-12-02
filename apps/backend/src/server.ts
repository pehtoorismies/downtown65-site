import { OpenAPIHono } from '@hono/zod-openapi'
import { Scalar } from '@scalar/hono-api-reference'
import { cors } from 'hono/cors'
import type { SchemaObject } from 'openapi3-ts/oas31'
import * as z from 'zod'

import { registerAuthRoutes } from './routes/authRoutes'
import { registerEventRoutes } from './routes/eventsRoutes'
import { ValidationErrorSchema, formatZodErrors } from './schemas/validation-error'
import { EventStore } from './store/eventsStore'

export type OpenAPIHonoType = OpenAPIHono<{ Bindings: Env }>

const app = new OpenAPIHono<{ Bindings: Env }>({
  defaultHook: (result, c) => {
    console.log('*********')
    console.log('Default hook called')
    console.log(JSON.stringify(result, null, 2))
    console.log('*********')
    if (!result.success) {
      return c.json(
        {
          // ok: false,
          // code: 422,
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

app.openAPIRegistry.registerComponent('securitySchemes', 'ApiKeyAuth', {
  type: 'apiKey',
  in: 'header',
  name: 'X-API-Key',
  description: 'API key required in the X-API-Key header.',
})

app.use('*', cors())

app.get('/healthz', (c) => c.json({ status: 'ok' }))

registerEventRoutes(app, new EventStore())
registerAuthRoutes(app)

app.doc31('/doc', {
  openapi: '3.1.0',
  info: {
    title: 'Event API',
    version: '1.0.0',
  },
})

app.get('/scalar', Scalar({ url: '/doc', theme: 'kepler' }))

// Export for Cloudflare Workers
export default app
