import { EventListSchema } from '@downtown65/schema'
import { createRoute } from '@hono/zod-openapi'
import type { AppAPI } from '~/app-api'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'
import { getEvents } from '../db/get-events'

const route = createRoute({
  description: 'Get list of events',
  method: 'get',
  middleware: [apiKeyAuth, jwtToken()],
  path: '/events',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: EventListSchema,
        },
      },
      description: 'List all events',
    },
  },
  security: [{ ApiKeyAuth: [], BearerToken: [] }],
})

export const register = (app: AppAPI) => {
  app.openapi(route, async (c) => {
    const events = await getEvents(c.get('requestContext'))
    return c.json(events, 200)
  })
}
