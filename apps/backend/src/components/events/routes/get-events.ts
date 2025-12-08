import { createRoute } from '@hono/zod-openapi'
import type { AppAPI } from '~/app-api'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'
import { EventListSchema } from './api-schema'

const route = createRoute({
  method: 'get',
  path: '/events',
  security: [{ ApiKeyAuth: [], BearerToken: [] }],
  middleware: [apiKeyAuth, jwtToken()],
  responses: {
    200: {
      description: 'List all events',
      content: {
        'application/json': {
          schema: EventListSchema,
        },
      },
    },
    // 401: {
    //   $ref: '#/components/responses/UnauthorizedError',
    // },
  },
})

export const register = (app: AppAPI) => {
  app.openapi(route, async (_c) => {
    throw new Error('Not implemented')
  })
}
