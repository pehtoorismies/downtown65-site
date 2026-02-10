import { MessageSchema, StringIDSchema } from '@downtown65/schema'
import { createRoute, z } from '@hono/zod-openapi'
import type { AppAPI } from '~/app-api'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'
import { joinEvent } from '../db/join-event'

const ParamsSchema = z.object({
  id: StringIDSchema,
})

const route = createRoute({
  description: 'Register the authenticated user as a participant to the event',
  method: 'post',
  middleware: [apiKeyAuth, jwtToken()],
  path: '/events/{id}/participants/me',
  request: {
    params: ParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': { schema: MessageSchema },
      },
      description: 'User is registered for the event successfully',
    },
    404: {
      content: {
        'application/json': { schema: MessageSchema },
      },
      description: 'Event not found',
    },
  },
  security: [{ ApiKeyAuth: [], BearerToken: [] }],
})

export const register = (app: AppAPI) => {
  app.openapi(route, async (c) => {
    const ctx = c.get('requestContext')
    const { id: eventId } = c.req.valid('param')
    const user = c.get('jwtPayload')

    const result = await joinEvent(ctx, {
      eventId,
      userAuth0Sub: user.sub,
    })

    switch (result.type) {
      case 'EventNotFound':
        return c.json({ message: result.error }, 404)
      case 'Success': {
        return c.json({ message: result.message }, 200)
      }
    }
  })
}
