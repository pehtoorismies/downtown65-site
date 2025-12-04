import { AuthApiError } from 'auth0'
import { jwtDecode } from 'jwt-decode'
import { z } from 'zod'
import type { AuthConfig } from '~/common/auth0/auth-config'
import { createAuthClient } from '~/common/auth0/client'
import type { LoginInput } from '../schema'
import { Auth0TokensSchema, Auth0UserSchema } from './misc/auth0'

const LoginResponse = z.discriminatedUnion('type', [
  z.object({ type: z.literal('InvalidCredentials'), error: z.string() }),
  z.object({ type: z.literal('UnknownError'), error: z.string() }),
  z.object({ type: z.literal('AccessDenied'), error: z.string() }),
  z.object({ type: z.literal('Success'), tokens: Auth0TokensSchema, user: Auth0UserSchema }),
])

type LoginResponse = z.infer<typeof LoginResponse>

export const login =
  (config: AuthConfig) =>
  async (input: LoginInput): Promise<LoginResponse> => {
    try {
      const authClient = createAuthClient(config)
      const result = await authClient.oauth.passwordGrant({
        username: input.email,
        password: input.password,
        audience: config.AUTH_AUDIENCE,
        // scope:
        //   'read:events write:events read:me write:me read:users openid profile email offline_access',
        scope: 'openid profile email offline_access',
      })

      const tokens = Auth0TokensSchema.parse(result.data)
      const user = Auth0UserSchema.parse(jwtDecode(tokens.idToken))

      return {
        type: 'Success',
        tokens,
        user,
      }
    } catch (error: unknown) {
      if (error instanceof AuthApiError) {
        switch (error.error) {
          case 'invalid_grant':
            return {
              type: 'InvalidCredentials',
              error: error.error_description,
            }
          case 'access_denied':
            return {
              type: 'AccessDenied',
              error: error.error_description,
            }
          default:
            return {
              type: 'UnknownError',
              error: error.error_description,
            }
        }
      }

      return {
        type: 'UnknownError',
        error: 'An unknown error occurred during login.',
      }
    }
  }
