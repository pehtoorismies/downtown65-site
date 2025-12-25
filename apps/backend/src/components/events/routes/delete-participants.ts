import { MessageSchema, StringIDSchema } from '@downtown65/schema'
import { createRoute } from '@hono/zod-openapi'
import type { AppAPI } from '~/app-api'
import { getConfig } from '~/common/config/config'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'
import { leaveEvent } from '../db/leave-event'
import { IDParamSchema } from './api-schema'

const route = createRoute({
  method: 'delete',
  path: '/events/{id}/participants/me',
  description: 'Unregister the authenticated user from the event',
  security: [{ ApiKeyAuth: [], BearerToken: [] }],
  middleware: [apiKeyAuth, jwtToken()],
  request: {
    params: IDParamSchema,
  },
  responses: {
    200: {
      description: 'User is unregistered from the event successfully',
      content: {
        'application/json': { schema: MessageSchema },
      },
    },
    404: {
      description: 'Event not found',
      content: {
        'application/json': { schema: MessageSchema },
      },
    },
  },
})

export const register = (app: AppAPI) => {
  app.openapi(route, async (c) => {
    const eventId = c.req.param('id')
    const user = c.get('jwtPayload')

    const result = await leaveEvent(getConfig(c.env), {
      eventId: StringIDSchema.parse(eventId),
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
