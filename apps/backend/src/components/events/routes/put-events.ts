import { createRoute } from '@hono/zod-openapi'
import type { AppAPI } from '~/app-api'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'
import { EventPathParamSchema, EventSchema, EventUpdateSchema, MessageSchema } from './api-schema'

const route = createRoute({
  method: 'put',
  path: '/events/{id}',
  security: [{ ApiKeyAuth: [], BearerToken: [] }],
  middleware: [apiKeyAuth, jwtToken()],
  request: {
    params: EventPathParamSchema,
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
  app.openapi(route, async (_c) => {
    throw new Error('Not implemented')
  })
}
