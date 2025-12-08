import { createRoute } from '@hono/zod-openapi'
import type { AppAPI } from '~/app-api'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'
import { EventPathParamSchema, MessageSchema } from './api-schema'

const route = createRoute({
  method: 'delete',
  path: '/events/{id}',
  security: [{ ApiKeyAuth: [], BearerToken: [] }],
  middleware: [apiKeyAuth, jwtToken()],
  request: {
    params: EventPathParamSchema,
  },
  responses: {
    204: {
      description: 'Event removed',
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
    const { id } = c.req.valid('param')
    // const deleted = store.delete(id)
    // if (!deleted) {
    //   return c.json({ message: `Event ${id} not found` }, 404)
    // }
    return c.body(null, 204)
  })
}
