import { ErrorResponseSchema } from '@downtown65/schema'
import { createRoute } from '@hono/zod-openapi'
import type { AppAPI } from '~/app-api'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'
import { createUsersStore } from '../store'
import { UserUpdateParamsSchema } from '../store/schema'
import { DetailedUserResponseSchema, RESTDetailedUserSchema } from './schema'

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
          schema: DetailedUserResponseSchema,
        },
      },
    },
    // 401: {
    //   $ref: '#/components/responses/UnauthorizedError',
    // },
    404: {
      description: 'User not found',
      content: {
        'application/json': { schema: ErrorResponseSchema },
      },
    },
    // 422: {
    //   $ref: '#/components/responses/ValidationError',
    // },
  },
})

export const register = (app: AppAPI) => {
  app.openapi(route, async (c) => {
    const payload = c.req.valid('json')
    const { sub } = c.get('jwtPayload')
    const store = createUsersStore(c.env)

    const updated = await store.updateUser(sub, payload)

    if (!updated) {
      return c.json({ message: 'User not found', code: 404 }, 404)
    }

    const response = RESTDetailedUserSchema.parse(updated)
    return c.json(response, 200)
  })
}
