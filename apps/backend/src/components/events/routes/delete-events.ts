import { createRoute } from '@hono/zod-openapi'

import type { AppAPI } from '~/app-api'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'
import { ErrorAPIResponseSchema } from '~/common/schema'
import { deleteEvent } from '../db/delete-event'
import { EventPathIDParamSchema } from './api-schema'

const route = createRoute({
  method: 'delete',
  path: '/events/{id}',
  security: [{ ApiKeyAuth: [], BearerToken: [] }],
  middleware: [apiKeyAuth, jwtToken()],
  request: {
    params: EventPathIDParamSchema,
  },
  responses: {
    204: {
      description: 'Event deleted successfully',
    },
    // 401: {
    //   $ref: '#/components/responses/UnauthorizedError',
    // },
    404: {
      description: 'Event not found',
      content: {
        'application/json': { schema: ErrorAPIResponseSchema },
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
    const deleted = await deleteEvent(c.env.D1_DB, id)

    if (!deleted) {
      return c.json({ message: 'Event not found', code: 404 }, 404)
    }

    return c.body(null, 204)
  })
}
