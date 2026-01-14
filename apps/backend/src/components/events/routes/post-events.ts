import { createLogger } from '@downtown65/logger'
import { EventCreateSchema, ULIDSchema } from '@downtown65/schema'
import { createRoute } from '@hono/zod-openapi'
import { z } from 'zod'
import type { AppAPI } from '~/app-api'
import { getConfig } from '~/common/config/config'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'
import { createEvent } from '../db/create-event'

const route = createRoute({
  method: 'post',
  path: '/events',
  security: [{ ApiKeyAuth: [], BearerToken: [] }],
  middleware: [apiKeyAuth, jwtToken()],
  request: {
    body: {
      description: 'Event payload',
      required: true,
      content: {
        'application/json': { schema: EventCreateSchema },
      },
    },
  },
  responses: {
    201: {
      description: 'Event created',
      content: {
        'application/json': { schema: z.object({ eventULID: ULIDSchema }) },
      },
    },
  },
})

export const register = (app: AppAPI) => {
  app.openapi(route, async (c) => {
    const logger = createLogger({
      appContext: 'OPENAPI: post event',
    })
    const eventData = c.req.valid('json')
    logger.withMetadata({ eventData }).debug('Creating new event')
    const { sub } = c.get('jwtPayload')

    const eventULID = await createEvent(getConfig(c.env), eventData, sub)
    return c.json({ eventULID: ULIDSchema.parse(eventULID) }, 201)
  })
}
