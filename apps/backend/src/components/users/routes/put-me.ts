import { MessageSchema } from '@downtown65/schema'
import { createRoute } from '@hono/zod-openapi'
import type { AppAPI } from '~/app-api'
import { getConfig } from '~/common/config/config'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'
import { updateUser } from '../db/update-user'
import { UserUpdateParamsSchema } from '../shared-schema'

const route = createRoute({
  method: 'put',
  path: '/users/me',
  description: 'Update the authenticated user information',
  security: [{ ApiKeyAuth: [], BearerToken: [] }],
  middleware: [apiKeyAuth, jwtToken()],
  request: {
    body: {
      description: 'User update payload',
      required: true,
      content: {
        'application/json': { schema: UserUpdateParamsSchema },
      },
    },
  },
  responses: {
    200: {
      description: 'User updated successfully',
      content: {
        'application/json': {
          schema: MessageSchema,
        },
      },
    },
    // 401: {
    //   $ref: '#/components/responses/UnauthorizedError',
    // },
    // 404: {
    //   description: 'User not found',
    //   content: {
    //     'application/json': { schema: ErrorResponseSchema },
    //   },
    // },
    // 422: {
    //   $ref: '#/components/responses/ValidationError',
    // },
  },
})

export const register = (app: AppAPI) => {
  app.openapi(route, async (c) => {
    const userParams = c.req.valid('json')
    const { sub } = c.get('jwtPayload')

    const updated = await updateUser(getConfig(c.env), sub, userParams)

    if (!updated) {
      throw new Error(`User with sub ${sub} not found`)
    }

    return c.json({ message: 'User updated successfully' }, 200)
  })
}
