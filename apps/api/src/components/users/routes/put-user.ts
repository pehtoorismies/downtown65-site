import {
  APIErrorResponseSchema,
  Auth0SubSchema,
  MessageSchema,
} from '@downtown65/schema'
import { createRoute, z } from '@hono/zod-openapi'
import type { AppAPI } from '~/app-api'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'
import { updateUser } from '../db/update-user'
import { UserUpdateParamsSchema } from '../shared-schema'

const ParamsSchema = z.object({
  auth0Sub: Auth0SubSchema,
})

const route = createRoute({
  description: 'Update the authenticated user information',
  method: 'put',
  middleware: [apiKeyAuth, jwtToken()],
  path: '/users/{auth0Sub}',
  request: {
    body: {
      content: {
        'application/json': { schema: UserUpdateParamsSchema },
      },
      description: 'User update payload',
      required: true,
    },
    params: ParamsSchema,
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
    // 401: {
    //   $ref: '#/components/responses/UnauthorizedError',
    // },
    404: {
      content: {
        'application/json': { schema: APIErrorResponseSchema },
      },
      description: 'User not found',
    },
    // 422: {
    //   $ref: '#/components/responses/ValidationError',
    // },
  },
  security: [{ ApiKeyAuth: [], BearerToken: [] }],
})

export const register = (app: AppAPI) => {
  app.openapi(route, async (c) => {
    const ctx = c.get('requestContext')
    const userParams = c.req.valid('json')
    const { auth0Sub } = c.req.valid('param')

    const updated = await updateUser(ctx, auth0Sub, userParams)

    if (!updated) {
      return c.json(
        { code: 404, message: `User with sub ${auth0Sub} not found` },
        404,
      )
    }
    return c.json({ message: 'User updated successfully' }, 200)
  })
}
