import { createRoute } from '@hono/zod-openapi'
import type { AppAPI } from '~/app-api'
import { getConfig } from '~/common/config/config'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'
import { ErrorAPIResponseSchema } from '~/common/schema'
import { updateUser } from '../db/update-user'
import { UserUpdateParamsSchema } from '../shared-schema'
import { DetailedUserAPIResponseSchema } from './api-schema'

const route = createRoute({
  method: 'put',
  path: '/users/{auth0Sub}',
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
          schema: DetailedUserAPIResponseSchema,
        },
      },
    },
    // 401: {
    //   $ref: '#/components/responses/UnauthorizedError',
    // },
    404: {
      description: 'User not found',
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
    const userParams = c.req.valid('json')
    const { auth0Sub } = c.req.param()

    const updated = await updateUser(getConfig(c.env), auth0Sub, userParams)

    if (!updated) {
      return c.json(
        { code: 404, message: `User with sub ${auth0Sub} not found` },
        404,
      )
    }

    return c.json(updated, 200)
  })
}
