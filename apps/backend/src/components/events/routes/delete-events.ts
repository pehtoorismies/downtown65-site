import { createLogger } from '@downtown65/logger'
import { APIErrorResponseSchema } from '@downtown65/schema'
import { createRoute } from '@hono/zod-openapi'
import type { AppAPI } from '~/app-api'
import { getConfig } from '~/common/config/config'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'
import { deleteEvent } from '../db/delete-event'
import { IDParamSchema } from './api-schema'

const route = createRoute({
  method: 'delete',
  path: '/events/{id}',
  security: [{ ApiKeyAuth: [], BearerToken: [] }],
  middleware: [apiKeyAuth, jwtToken()],
  request: {
    params: IDParamSchema,
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
        'application/json': { schema: APIErrorResponseSchema },
      },
    },
    // 422: {
    //   $ref: '#/components/responses/ValidationError',
    // },
  },
})

export const register = (app: AppAPI) => {
  app.openapi(route, async (c) => {
    const logger = createLogger({ appContext: 'Route: Delete Event By ID' })
    const { id } = c.req.valid('param')
    logger.info(`Deleting event with ID ${id}`)

    const deleted = await deleteEvent(getConfig(c.env), id)

    logger.info(`Delete successful: ${deleted}`)

    if (!deleted) {
      return c.json({ message: 'Event not found', code: 404 }, 404)
    }

    return c.body(null, 204)
  })
}
