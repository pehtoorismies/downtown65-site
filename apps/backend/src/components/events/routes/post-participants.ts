import { createRoute } from '@hono/zod-openapi'
import type { AppAPI } from '~/app-api'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'
import { EventPathIDParamSchema, MessageSchema } from './api-schema'

const route = createRoute({
  method: 'post',
  path: '/events/{id}/participants/me',
  description: 'Register the authenticated user as a participant to the event',
  security: [{ ApiKeyAuth: [], BearerToken: [] }],
  middleware: [apiKeyAuth, jwtToken()],
  request: {
    params: EventPathIDParamSchema,
  },
  responses: {
    200: {
      description: 'User is registered for the event successfully',
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
