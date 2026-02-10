import {
  EventUpdateSchema,
  MessageSchema,
  StringIDSchema,
} from '@downtown65/schema'
import { createRoute, z } from '@hono/zod-openapi'
import type { AppAPI } from '~/app-api'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'
import { getEventById } from '../db/get-event-by-id'
import { updateEvent } from '../db/update-event'

const ParamsSchema = z.object({
  id: StringIDSchema,
})

const route = createRoute({
  method: 'put',
  middleware: [apiKeyAuth, jwtToken()],
  path: '/events/{id}',
  request: {
    body: {
      content: {
        'application/json': { schema: EventUpdateSchema },
      },
      required: true,
    },
    params: ParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': { schema: MessageSchema },
      },
      description: 'Event updated',
    },
    403: {
      content: {
        'application/json': { schema: MessageSchema },
      },
      description: 'Only event creator can update event',
    },
    404: {
      content: {
        'application/json': { schema: MessageSchema },
      },
      description: 'Event not found',
    },
  },
  security: [{ ApiKeyAuth: [], BearerToken: [] }],
})

export const register = (app: AppAPI) => {
  app.openapi(route, async (c) => {
    const ctx = c.get('requestContext')
    const { id: eventId } = c.req.valid('param')
    const eventData = c.req.valid('json')

    // Check if event exists
    const existingEvent = await getEventById(ctx, eventId)
    if (!existingEvent) {
      return c.json({ message: 'Event not found' }, 404)
    }

    ctx.logger.withMetadata({ eventData }).debug('Updating event')
    await updateEvent(ctx, eventId, eventData)
    return c.json({ message: 'Event updated successfully' }, 200)
  })
}
