import { createRoute } from '@hono/zod-openapi'
import type { AppAPI } from '~/app-api'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'
import { getEventByULID } from '../db/get-event-by-id'
import { EventSchema } from '../shared-schema'
import { EventPathParamSchema, MessageSchema } from './api-schema'

const route = createRoute({
  method: 'get',
  path: '/events/{id}',
  security: [{ ApiKeyAuth: [] }],
  middleware: [apiKeyAuth, jwtToken({ allowAnon: true })],
  request: {
    params: EventPathParamSchema,
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
    const { eventULID } = c.req.valid('param')

    const event = await getEventByULID(c.env.D1_DB, eventULID)

    if (!event) {
      return c.json({ message: `Event with id ${eventULID} not found` }, 404)
    }

    return c.json(EventSchema.parse(event), 200)
  })
}
