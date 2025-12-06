import { createRoute } from '@hono/zod-openapi'
import { Page } from 'auth0'
import z from 'zod'
import type { AppAPI } from '~/app-api'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'
import { createUsersStore } from '../store'
import {
  Auth0UserListResponseSchema,
  Auth0UserSchema,
  PaginationQuerySchema,
} from '../store/schema'
import { UserResponseSchema } from './schema'

const RESTUserListSchema = Auth0UserListResponseSchema.transform((data) => ({
  ...data,
  users: data.users.map((user) => {
    return {
      ...user,
      id: user.user_id,
      createdAt: user.created_at,
    }
  }),
}))

const route = createRoute({
  method: 'get',
  path: '/users',
  description: 'Get all users',
  security: [{ ApiKeyAuth: [], BearerToken: [] }],
  middleware: [apiKeyAuth, jwtToken()],
  request: {
    query: PaginationQuerySchema,
  },
  responses: {
    200: {
      description: 'List of all users',
      content: {
        'application/json': {
          schema: z.object({
            users: z.array(UserResponseSchema),
            total: z.number(),
            start: z.number(),
            limit: z.number(),
            length: z.number(),
          }),
        },
      },
    },
    // 401: {
    //   $ref: '#/components/responses/UnauthorizedError',
    // },
  },
})

export const register = (app: AppAPI) => {
  app.openapi(route, async (c) => {
    const { page, limit } = c.req.valid('query')
    const store = createUsersStore(c.env)
    const paginatedUsers = await store.getUsers({ page, limit })

    const response = RESTUserListSchema.parse(paginatedUsers)
    return c.json(response, 200)
  })
}
