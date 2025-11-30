import { z } from 'zod'
import type { AppAPI } from '../app-api'
import { AuthStore } from '../store/auth'

// Schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})
export type LoginInput = z.infer<typeof loginSchema>

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  registerSecret: z.string(),
})
export type RegisterInput = z.infer<typeof registerSchema>

const forgotPasswordSchema = z.object({
  email: z.string().email(),
})
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

const refreshTokenSchema = z.object({
  refreshToken: z.string(),
})
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>

const environmentSchema = z.object({
  AUTH_DOMAIN: z.string(),
  AUTH_CLIENT_ID: z.string(),
  AUTH_CLIENT_SECRET: z.string(),
  AUTH_AUDIENCE: z.string(),
  REGISTER_SECRET: z.string(),
})

const getStoreFromContext = (env: Env): AuthStore => {
  const values = environmentSchema.parse(env)

  return new AuthStore({
    AUTH_DOMAIN: values.AUTH_DOMAIN,
    AUTH_CLIENT_ID: values.AUTH_CLIENT_ID,
    AUTH_CLIENT_SECRET: values.AUTH_CLIENT_SECRET,
    AUTH_AUDIENCE: values.AUTH_AUDIENCE,
    REGISTER_SECRET: values.REGISTER_SECRET,
  })
}

// Register routes
export function registerAuthRoutes(app: AppAPI) {
  // Login
  app.openapi(
    {
      method: 'post',
      path: '/auth/login',
      request: {
        body: {
          content: {
            'application/json': {
              schema: loginSchema,
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
        401: {
          description: 'Invalid credentials',
          content: {
            'application/json': {
              schema: z.object({
                error: z.string(),
              }),
            },
          },
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

      const store = getStoreFromContext(c.env)
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
      request: {
        body: {
          content: {
            'application/json': {
              schema: registerSchema,
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

  // Logout
  app.openapi(
    {
      method: 'post',
      path: '/auth/logout',
      security: [{ ApiKeyAuth: [] }],
      responses: {
        200: {
          description: 'Logout successful',
          content: {
            'application/json': {
              schema: z.object({
                message: z.string(),
              }),
            },
          },
        },
      },
    },
    async (c) => {
      // TODO: Implement logout logic
      // - Invalidate token/session

      return c.json({ message: 'Logged out successfully' })
    },
  )

  // Forgot Password
  app.openapi(
    {
      method: 'post',
      path: '/auth/forgot-password',
      request: {
        body: {
          content: {
            'application/json': {
              schema: forgotPasswordSchema,
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
      request: {
        body: {
          content: {
            'application/json': {
              schema: refreshTokenSchema,
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
              }),
            },
          },
        },
      },
    },
    async (c) => {
      const { refreshToken } = c.req.valid('json')

      // TODO: Implement token refresh logic
      // - Validate refresh token
      // - Generate new access token

      return c.json({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      })
    },
  )
}
