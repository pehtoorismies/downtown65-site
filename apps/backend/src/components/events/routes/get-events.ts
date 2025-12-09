import { createRoute } from '@hono/zod-openapi'
import type { AppAPI } from '~/app-api'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'
import { getEvents } from '../db/get-events'
import { EventListSchema } from '../shared-schema'

const route = createRoute({
  method: 'get',
  path: '/events',
  description: 'Get list of events',
  security: [{ ApiKeyAuth: [], BearerToken: [] }],
  middleware: [apiKeyAuth, jwtToken()],
  responses: {
    200: {
      description: 'List all events',
      content: {
        'application/json': {
          schema: EventListSchema,
        },
      },
    },
    // 401: {
    //   $ref: '#/components/responses/UnauthorizedError',
    // },
  },
})

export const register = (app: AppAPI) => {
  app.openapi(route, async (c) => {
    const db = c.env.D1_DB
    const events = await getEvents(db)
    return c.json(events, 200)
  })
}
