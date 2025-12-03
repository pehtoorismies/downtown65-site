import { createRoute, z } from '@hono/zod-openapi'
import { jwk } from 'hono/jwk'
import { getAuthConfigFromEnv } from '~/common/auth0/auth-config'
import { getManagementClient } from '~/common/auth0/client'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'
import type { AppAPI } from '../../app-api'
import { PaginationQuerySchema, User, UserListSchema, UserSchema, UserUpdateSchema } from './schema'
import { createUsersStore } from './store'

const MessageSchema = z.object({
  message: z.string(),
})

const defaultMiddleware = [apiKeyAuth, jwtToken()]

export const registerUserRoutes = (app: AppAPI): void => {
  // GET /users - List all users
  app.openapi(
    createRoute({
      method: 'get',
      path: '/users',
      description: 'Get all users',
      security: [{ ApiKeyAuth: [], BearerToken: [] }],
      middleware: defaultMiddleware,
      request: {
        query: PaginationQuerySchema,
      },
      responses: {
        200: {
          description: 'List of all users',
          content: {
            'application/json': {
              schema: UserListSchema,
            },
          },
        },
        401: {
          $ref: '#/components/responses/UnauthorizedError',
        },
      },
    }),
    async (c) => {
      const { page, limit } = c.req.valid('query')
      const store = createUsersStore(c.env)
      const users = await store.listUsers({ page, limit })
      return c.json(users, 200)
    },
  )

  // GET /users/me - Get my information
  app.openapi(
    createRoute({
      method: 'get',
      path: '/users/me',
      description: 'Get the authenticated user information',
      security: [{ ApiKeyAuth: [], BearerToken: [] }],
      middleware: defaultMiddleware,
      responses: {
        200: {
          description: 'User information',
          content: {
            'application/json': {
              schema: UserSchema,
            },
          },
        },
        401: {
          $ref: '#/components/responses/UnauthorizedError',
        },
        404: {
          description: 'User not found',
          content: {
            'application/json': { schema: MessageSchema },
          },
        },
        422: {
          $ref: '#/components/responses/ValidationError',
        },
      },
    }),
    (c) => {
      const jwtPayload = c.get('jwtPayload')
      const userId = jwtPayload?.sub

      if (!userId) {
        return c.json({ message: 'User not authenticated' }, 401)
      }

      const user = store.get(userId)
      if (!user) {
        return c.json({ message: 'User not found' }, 404)
      }

      return c.json(user, 200)
    },
  )

  // PUT /users/me - Update my information
  app.openapi(
    createRoute({
      method: 'put',
      path: '/users/me',
      description: 'Update the authenticated user information',
      security: [{ ApiKeyAuth: [], BearerToken: [] }],
      middleware: defaultMiddleware,
      request: {
        body: {
          description: 'User update payload',
          required: true,
          content: {
            'application/json': { schema: UserUpdateSchema },
          },
        },
      },
      responses: {
        200: {
          description: 'User updated successfully',
          content: {
            'application/json': {
              schema: UserSchema,
            },
          },
        },
        401: {
          $ref: '#/components/responses/UnauthorizedError',
        },
        404: {
          description: 'User not found',
          content: {
            'application/json': { schema: MessageSchema },
          },
        },
        422: {
          $ref: '#/components/responses/ValidationError',
        },
      },
    }),
    async (c) => {
      const jwtPayload = c.get('jwtPayload')
      const userId = jwtPayload.sub

      const payload = await c.req.valid('json')
      const updated = store.update(userId, payload)

      if (!updated) {
        return c.json({ message: 'User not found' }, 404)
      }

      return c.json(updated, 200)
    },
  )
}
