import { createRoute } from '@hono/zod-openapi'
import type { AppAPI } from '~/app-api'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'
import { EventCreateSchema, EventSchema } from './api-schema'

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
        'application/json': { schema: EventSchema },
      },
    },
    // 401: {
    //   $ref: '#/components/responses/UnauthorizedError',
    // },
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
