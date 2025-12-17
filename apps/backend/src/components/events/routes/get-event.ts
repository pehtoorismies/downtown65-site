import { createLogger } from '@downtown65/logger'
import { EventSchema } from '@downtown65/schema'
import { createRoute } from '@hono/zod-openapi'
import type { AppAPI } from '~/app-api'
import { getConfig } from '~/common/config/config'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'
import { getEventByULID } from '../db/get-event-by-id'
import { EventPathULIDParamSchema, MessageSchema } from './api-schema'

const route = createRoute({
  method: 'get',
  path: '/events/{eventULID}',
  security: [{ ApiKeyAuth: [] }],
  middleware: [apiKeyAuth, jwtToken({ allowAnon: true })],
  request: {
    params: EventPathULIDParamSchema,
  },
  responses: {
    200: {
      description: 'Event found',
      content: {
        'application/json': { schema: EventSchema },
      },
    },
    // 401: {
    //   $ref: '#/components/responses/UnauthorizedError',
    // },
    404: {
      description: 'Event not found',
      content: {
        'application/json': { schema: MessageSchema },
      },
    },
    // 422: {
    //   $ref: '#/components/responses/ValidationError',
    // },
  },
})

export const register = (app: AppAPI) => {
  app.openapi(route, async (c) => {
    const logger = createLogger({ appContext: 'Route: Get Event By ULID' })
    const eventULID = c.req.param('eventULID')

    logger.info(`Fetching event by ULID ${eventULID}`)

    const event = await getEventByULID(getConfig(c.env), eventULID)
    logger.withMetadata({ data: event }).debug('Fetched event by ULID')

    if (!event) {
      return c.json({ message: `Event with id ${eventULID} not found` }, 404)
    }

    return c.json(EventSchema.parse(event), 200)
  })
}
