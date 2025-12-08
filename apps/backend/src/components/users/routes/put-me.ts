import { createRoute } from '@hono/zod-openapi'
import type { AppAPI } from '~/app-api'
import { getAuthConfigFromEnv } from '~/common/auth0/auth-config'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'
import { updateUser } from '../db/update-user'
import { UserUpdateParamsSchema } from '../shared-schema'
import { DetailedUserAPIResponseSchema } from './api-schema'

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
          schema: DetailedUserAPIResponseSchema,
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
    const payload = c.req.valid('json')
    const { sub } = c.get('jwtPayload')
    const authConfig = getAuthConfigFromEnv(c.env)

    const updated = await updateUser(authConfig, sub, payload)

    if (!updated) {
      throw new Error(`User with sub ${sub} not found`)
    }

    return c.json(updated, 200)
  })
}
