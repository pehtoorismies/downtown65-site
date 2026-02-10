import {
  EventSchema,
  MessageSchema,
  StringIDSchema,
  ULIDSchema,
} from '@downtown65/schema'
import { createRoute, z } from '@hono/zod-openapi'
import type { AppAPI } from '~/app-api'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'
import { getEventById } from '../db/get-event-by-id'
import { getEventByULID } from '../db/get-event-by-ULID'

const IdOrULIDSchema = z.union([StringIDSchema, ULIDSchema])

const ParamsSchema = z.object({
  idOrULID: IdOrULIDSchema,
})

const route = createRoute({
  method: 'get',
  middleware: [apiKeyAuth, jwtToken({ allowAnon: true })],
  path: '/events/{idOrULID}',
  request: {
    params: ParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': { schema: EventSchema },
      },
      description: 'Retrieve the event',
    },
    404: {
      content: {
        'application/json': { schema: MessageSchema },
      },
      description: 'Event not found',
    },
  },
  security: [{ ApiKeyAuth: [] }],
})

export const register = (app: AppAPI) => {
  app.openapi(route, async (c) => {
    const ctx = c.get('requestContext')

    const { idOrULID } = c.req.valid('param')
    ctx.logger.info(`Fetching event by idOrULID ${idOrULID}`)

    const event =
      typeof idOrULID === 'number'
        ? await getEventById(ctx, idOrULID)
        : await getEventByULID(ctx, idOrULID)

    ctx.logger.withMetadata({ event }).debug('Fetched event')

    if (!event) {
      return c.json({ message: `Event with id ${idOrULID} not found` }, 404)
    } else {
      return c.json(EventSchema.parse(event), 200)
    }
  })
}
