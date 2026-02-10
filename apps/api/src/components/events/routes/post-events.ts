import { EventCreateSchema, ULIDSchema } from '@downtown65/schema'
import { createRoute } from '@hono/zod-openapi'
import { z } from 'zod'
import type { AppAPI } from '~/app-api'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'
import { createEvent } from '../db/create-event'

const route = createRoute({
  method: 'post',
  middleware: [apiKeyAuth, jwtToken()],
  path: '/events',
  request: {
    body: {
      content: {
        'application/json': { schema: EventCreateSchema },
      },
      description: 'Event payload',
      required: true,
    },
  },
  responses: {
    201: {
      content: {
        'application/json': { schema: z.object({ eventULID: ULIDSchema }) },
      },
      description: 'Event created',
    },
  },
  security: [{ ApiKeyAuth: [], BearerToken: [] }],
})

export const register = (app: AppAPI) => {
  app.openapi(route, async (c) => {
    const ctx = c.get('requestContext')
    const eventData = c.req.valid('json')
    ctx.logger.withMetadata({ eventData }).debug('Creating new event')
    const { sub } = c.get('jwtPayload')

    const eventULID = await createEvent(ctx, eventData, sub)
    return c.json({ eventULID: ULIDSchema.parse(eventULID) }, 201)
  })
}
