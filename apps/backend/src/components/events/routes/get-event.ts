import { createRoute } from '@hono/zod-openapi'
import type { AppAPI } from '~/app-api'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'

import { EventPathParamSchema, EventSchema, MessageSchema } from './api-schema'

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
  app.openapi(route, async (_c) => {
    throw new Error('Not implemented')
  })
}
