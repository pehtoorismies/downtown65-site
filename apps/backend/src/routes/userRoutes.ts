import { createRoute, z } from '@hono/zod-openapi'
import { jwk } from 'hono/jwk'
import { apiKeyAuth } from '~/middleware/apiKeyAuth'
import type { AppAPI } from '../app-api'
import { UserListSchema, UserSchema, UserUpdateSchema } from '../schemas/user'
import type { UserStore } from '../store/userStore'

const MessageSchema = z.object({
  message: z.string(),
})

const getUri = (domain: string) => `https://${domain}/.well-known/jwks.json`

export const registerUserRoutes = (app: AppAPI, store: UserStore): void => {
  // Protected routes - require X-API-Key authentication
  app.use('/users/*', apiKeyAuth)

  // All user routes require JWT authentication
  app.use(
    '/users/*',
    jwk({
      jwks_uri: (c) => getUri(c.env.AUTH_DOMAIN),
    }),
  )

  // GET /users - List all users
  app.openapi(
    createRoute({
      method: 'get',
      path: '/users',
      description: 'Get all users',
      security: [{ ApiKeyAuth: [], BearerToken: [] }],
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
        422: {
          $ref: '#/components/responses/ValidationError',
        },
      },
    }),
    (c) => {
      return c.json(store.list())
    },
  )

  // GET /users/me - Get my information
  app.openapi(
    createRoute({
      method: 'get',
      path: '/users/me',
      description: 'Get the authenticated user information',
      security: [{ ApiKeyAuth: [], BearerToken: [] }],
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
      const userId = jwtPayload?.sub

      if (!userId) {
        return c.json({ message: 'User not authenticated' }, 401)
      }

      const payload = await c.req.valid('json')
      const updated = store.update(userId, payload)

      if (!updated) {
        return c.json({ message: 'User not found' }, 404)
      }

      return c.json(updated, 200)
    },
  )
}
