import { createLogger } from '@downtown65/logger'
import { EventUpdateSchema, MessageSchema } from '@downtown65/schema'
import { createRoute } from '@hono/zod-openapi'
import type { AppAPI } from '~/app-api'
import { getConfig } from '~/common/config/config'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'
import { updateEvent } from '../db/update-event'
import { IDParamSchema } from './api-schema'

const route = createRoute({
  method: 'put',
  path: '/events/{id}',
  security: [{ ApiKeyAuth: [], BearerToken: [] }],
  middleware: [apiKeyAuth, jwtToken()],
  request: {
    params: IDParamSchema,
    body: {
      required: true,
      content: {
        'application/json': { schema: EventUpdateSchema },
      },
    },
  },
  responses: {
    200: {
      description: 'Event updated',
      content: {
        'application/json': { schema: MessageSchema },
      },
    },

    404: {
      description: 'Event not found',
      content: {
        'application/json': { schema: MessageSchema },
      },
    },
  },
})

export const register = (app: AppAPI) => {
  app.openapi(route, async (c) => {
    const logger = createLogger({
      appContext: 'OPENAPI: put event',
    })
    const eventId = c.req.param('id')
    const eventData = c.req.valid('json')
    logger.withMetadata({ eventData }).debug('Updating event')
    await updateEvent(getConfig(c.env), Number(eventId), eventData)
    return c.json({ message: 'Event updated successfully' }, 200)
  })
}
