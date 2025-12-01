import { AuthApiError } from 'auth0'
import { jwtDecode } from 'jwt-decode'
import type { LoginInput } from '~/routes/authRoutes'
import type { AuthConfig } from './misc/auth-config'
import { createAuthClient } from './misc/client'
import { type Auth0Tokens, type Auth0User, auth0TokensSchema, auth0UserSchema } from './misc/types'

type InvalidCredentialsError = {
  type: 'InvalidCredentials'
  error: string
}

type UnknownError = {
  type: 'UnknownError'
  error: string
}

type AccessDeniedError = {
  type: 'AccessDenied'
  error: string
}

type LoginSuccess = {
  type: 'Success'
  tokens: Auth0Tokens
  user: Auth0User
}

type LoginResponse = InvalidCredentialsError | UnknownError | AccessDeniedError | LoginSuccess

export const login =
  (config: AuthConfig) =>
  async (input: LoginInput): Promise<LoginResponse> => {
    try {
      const authClient = createAuthClient(config)
      const result = await authClient.oauth.passwordGrant({
        username: input.email,
        password: input.password,
        audience: config.AUTH_AUDIENCE,
        scope:
          'read:events write:events read:me write:me read:users openid profile email offline_access',
      })

      const tokens = auth0TokensSchema.parse(result.data)
      const user = auth0UserSchema.parse(jwtDecode(tokens.idToken))

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
