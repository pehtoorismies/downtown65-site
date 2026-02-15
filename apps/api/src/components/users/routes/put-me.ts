import { MessageSchema } from '@downtown65/schema'
import { createRoute } from '@hono/zod-openapi'
import type { AppAPI } from '~/app-api'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'
import { updateUser } from '../db/update-user'
import { UserUpdateParamsSchema } from '../shared-schema'

const route = createRoute({
  description: 'Update the authenticated user information',
  method: 'put',
  middleware: [apiKeyAuth, jwtToken()],
  path: '/users/me',
  request: {
    body: {
      content: {
        'application/json': { schema: UserUpdateParamsSchema },
      },
      description: 'User update payload',
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: MessageSchema,
        },
      },
      description: 'User updated successfully',
    },
  },
  security: [{ ApiKeyAuth: [], BearerToken: [] }],
})

export const register = (app: AppAPI) => {
  app.openapi(route, async (c) => {
    const ctx = c.get('requestContext')
    const userParams = c.req.valid('json')
    const { sub } = c.get('jwtPayload')

    const updated = await updateUser(ctx, sub, userParams)

    if (!updated) {
      throw new Error(`User with sub ${sub} not found`)
    }

    return c.json({ message: 'User updated successfully' }, 200)
  })
}
