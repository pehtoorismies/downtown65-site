import { APIErrorResponseSchema, StringIDSchema } from '@downtown65/schema'
import { createRoute, z } from '@hono/zod-openapi'
import type { AppAPI } from '~/app-api'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'
import { getUserId } from '~/components/users/db/get-user-id'
import { deleteEvent } from '../db/delete-event'
import { getEventById } from '../db/get-event-by-id'

const ParamsSchema = z.object({
  id: StringIDSchema,
})

const route = createRoute({
  method: 'delete',
  middleware: [apiKeyAuth, jwtToken()],
  path: '/events/{id}',
  request: {
    params: ParamsSchema,
  },
  responses: {
    204: {
      description: 'Event deleted successfully',
    },
    403: {
      content: {
        'application/json': { schema: APIErrorResponseSchema },
      },
      description: 'Only event creator can delete event',
    },
    404: {
      content: {
        'application/json': { schema: APIErrorResponseSchema },
      },
      description: 'Event not found',
    },
  },
  security: [{ ApiKeyAuth: [], BearerToken: [] }],
})

export const register = (app: AppAPI) => {
  app.openapi(route, async (c) => {
    const ctx = c.get('requestContext')
    const { id } = c.req.valid('param')
    const jwtPayload = c.var.jwtPayload

    ctx.logger.info(`Deleting event with ID ${id}`)

    // Check if event exists
    const existingEvent = await getEventById(ctx, id)
    if (!existingEvent) {
      return c.json({ code: 404, message: 'Event not found' }, 404)
    }

    // SECURITY: Only event creator can delete the event
    const requestingUserId = await getUserId(ctx, jwtPayload.sub)
    if (!requestingUserId || existingEvent.createdBy.id !== requestingUserId) {
      return c.json(
        { code: 403, message: 'Only event creator can delete event' },
        403,
      )
    }

    const deleted = await deleteEvent(ctx, id)
    ctx.logger.info(`Delete successful: ${deleted}`)

    return c.body(null, 204)
  })
}
