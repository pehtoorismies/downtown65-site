import { OpenAPIHono } from '@hono/zod-openapi'
import { apiReference } from '@scalar/hono-api-reference'
import { cors } from 'hono/cors'

import type { AppAPI } from './app-api'
import { registerAuthRoutes } from './routes/authRoutes'
import { registerEventRoutes } from './routes/eventsRoutes'
import { EventStore } from './store/eventsStore'

export type OpenAPIHonoType = OpenAPIHono<{ Bindings: Env }>

const app = new OpenAPIHono<{ Bindings: Env }>()

app.openAPIRegistry.registerComponent('securitySchemes', 'ApiKeyAuth', {
  type: 'apiKey',
  in: 'header',
  name: 'X-API-Key',
  description: 'API key required in the X-API-Key header.',
})

app.use('*', cors())

app.get('/healthz', (c) => c.json({ status: 'oks' }))

registerEventRoutes(app, new EventStore())
registerAuthRoutes(app)

app.doc('/openapi.json', {
  openapi: '3.1.0',
  info: {
    title: 'Event API',
    version: '1.0.0',
  },
})

app.get(
  '/doc',
  apiReference({
    spec: { url: '/openapi.json' },
    layout: 'classic',
    theme: 'kepler',
  }),
)

// Export for Cloudflare Workers
export default app
