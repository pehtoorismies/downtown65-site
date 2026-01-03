import { createLogger } from '@downtown65/logger'
import {
  EventSchema,
  IDSchema,
  MessageSchema,
  ULIDSchema,
} from '@downtown65/schema'
import { createRoute } from '@hono/zod-openapi'
import { z } from 'zod'
import type { AppAPI } from '~/app-api'
import { type Config, getConfig } from '~/common/config/config'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'
import { getEventById } from '../db/get-event-by-id'
import { getEventByULID } from '../db/get-event-by-ULID'

const IDOrULIDSchema = z.object({
  idOrULID: z
    .string()
    .regex(
      /^(?:\d+|[0-9A-HJKMNP-TV-Z]{26})$/i,
      'Must be positive integer or ULID',
    )
    .openapi({ param: { name: 'idOrULID', in: 'path' }, example: '123' }),
})

const route = createRoute({
  method: 'get',
  path: '/events/{idOrULID}',
  security: [{ ApiKeyAuth: [] }],
  middleware: [apiKeyAuth, jwtToken({ allowAnon: true })],
  request: {
    params: IDOrULIDSchema,
  },
  responses: {
    200: {
      description: 'Event found',
      content: {
        'application/json': { schema: EventSchema },
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

const getEvent = (idOrULID: string, config: Config) => {
  if (/^\d+$/.test(idOrULID)) {
    return getEventById(config, IDSchema.decode(Number(idOrULID)))
  } else {
    return getEventByULID(config, ULIDSchema.decode(idOrULID))
  }
}

export const register = (app: AppAPI) => {
  app.openapi(route, async (c) => {
    const logger = createLogger({
      appContext: 'OPENAPI Route: Get Event By ID or ULID',
    })

    const idOrULID = c.req.param('idOrULID')
    logger.info(`Fetching event by idOrULID ${idOrULID}`)

    const event = await getEvent(idOrULID, getConfig(c.env))

    logger.withMetadata({ event }).debug('Fetched event')

    if (!event) {
      return c.json({ message: `Event with id ${idOrULID} not found` }, 404)
    }

    return c.json(EventSchema.parse(event), 200)
  })
}
