import { z } from 'zod'
import { id } from 'zod/locales'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import type { AppAPI } from '../../app-api'
import {
  ErrorSchema,
  ForgotPasswordParamSchema,
  LoginParamSchema,
  RefreshTokenParamSchema,
  RegisterParamSchema,
} from './schema'
import { createAuthStore } from './store'

// Register routes
export function registerRoutes(app: AppAPI) {
  // Login
  app.openapi(
    {
      method: 'post',
      path: '/auth/login',
      security: [{ ApiKeyAuth: [] }],
      middleware: [apiKeyAuth],
      request: {
        body: {
          content: {
            'application/json': {
              schema: LoginParamSchema,
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Login successful',
          content: {
            'application/json': {
              schema: z.object({
                accessToken: z.string(),
                refreshToken: z.string(),
                idToken: z.string(),
                expiresIn: z.number(),
                user: z.object({
                  id: z.string(),
                  email: z.string(),
                  name: z.string(),
                  nickname: z.string(),
                  picture: z.string(),
                }),
              }),
            },
          },
        },
        400: {
          content: {
            'application/json': {
              schema: ErrorSchema,
            },
          },
          description: 'Returns an error',
        },
        401: {
          $ref: '#/components/responses/UnauthorizedError',
        },
        403: {
          description: 'Access denied',
          content: {
            'application/json': {
              schema: z.object({
                error: z.string(),
              }),
            },
          },
        },
        422: {
          $ref: '#/components/responses/ValidationError',
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: z.object({
                error: z.string(),
              }),
            },
          },
        },
      },
    },
    async (c) => {
      const { email, password } = c.req.valid('json')

      const store = createAuthStore(c.env)
      const response = await store.login({ email, password })

      switch (response.type) {
        case 'InvalidCredentials':
          return c.json({ error: response.error }, 401)
        case 'AccessDenied':
          return c.json({ error: response.error }, 403)
        case 'UnknownError':
          return c.json({ error: response.error }, 500)
        case 'Success': {
          return c.json(
            {
              accessToken: response.tokens.accessToken,
              refreshToken: response.tokens.refreshToken,
              idToken: response.tokens.idToken,
              expiresIn: response.tokens.expiresIn,
              user: response.user,
            },
            200,
          )
        }
      }
    },
  )

  // Register
  app.openapi(
    {
      method: 'post',
      path: '/auth/register',
      security: [{ ApiKeyAuth: [] }],
      middleware: [apiKeyAuth],
      request: {
        body: {
          content: {
            'application/json': {
              schema: RegisterParamSchema,
            },
          },
        },
      },
      responses: {
        201: {
          description: 'User registered successfully',
          content: {
            'application/json': {
              schema: z.object({
                accessToken: z.string(),
                refreshToken: z.string(),
                user: z.object({
                  id: z.string(),
                  email: z.string(),
                  name: z.string(),
                }),
              }),
            },
          },
        },
        401: {
          $ref: '#/components/responses/UnauthorizedError',
        },
        403: {
          description: 'Access denied',
          content: {
            'application/json': {
              schema: z.object({
                error: z.string(),
              }),
            },
          },
        },
        422: {
          $ref: '#/components/responses/ValidationError',
        },
      },
    },
    async (c) => {
      const { email, password, name, registerSecret } = c.req.valid('json')

      if (registerSecret !== c.env.REGISTER_SECRET) {
        return c.json({ error: 'Access denied' }, 403)
      }

      // TODO: Implement registration logic
      // - Hash password
      // - Create user
      // - Generate tokens

      return c.json(
        {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          user: {
            id: '1',
            email,
            name,
          },
        },
        201,
      )
    },
  )

  // Forgot Password
  app.openapi(
    {
      method: 'post',
      path: '/auth/forgot-password',
      security: [{ ApiKeyAuth: [] }],
      middleware: [apiKeyAuth],
      request: {
        body: {
          content: {
            'application/json': {
              schema: ForgotPasswordParamSchema,
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Password reset email sent',
          content: {
            'application/json': {
              schema: z.object({
                message: z.string(),
              }),
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
    },
    async (c) => {
      const { email } = c.req.valid('json')

      // TODO: Implement forgot password logic
      // - Generate reset token
      // - Send reset email

      return c.json({ message: 'Password reset email sent' })
    },
  )

  // Refresh Token
  app.openapi(
    {
      method: 'post',
      path: '/auth/refresh-token',
      security: [{ ApiKeyAuth: [] }],
      middleware: [apiKeyAuth],
      request: {
        body: {
          content: {
            'application/json': {
              schema: RefreshTokenParamSchema,
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Token refreshed successfully',
          content: {
            'application/json': {
              schema: z.object({
                accessToken: z.string(),
                refreshToken: z.string(),
                idToken: z.string(),
              }),
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
    },
    async (c) => {
      const { refreshToken } = c.req.valid('json')
      console.log('Refresh token request received', refreshToken)
      const store = createAuthStore(c.env)
      const refreshedTokens = await store.refreshToken({ refreshToken })

      // TODO: Implement token refresh logic
      // - Validate refresh token
      // - Generate new access token

      return c.json(refreshedTokens)
    },
  )
}
