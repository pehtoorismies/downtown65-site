import { createLogger } from '@downtown65/logger'
import { AuthApiError } from 'auth0'
import { z } from 'zod'
import { createAuthClient } from '~/common/auth0/client'
import type { Config } from '~/common/config/config'
import type { LoginInput } from '../shared-schema'
import { Auth0TokensSchema } from './support/auth0-schema'

const LoginResponse = z.discriminatedUnion('type', [
  z.object({ type: z.literal('InvalidCredentials'), error: z.string() }),
  z.object({ type: z.literal('UnknownError'), error: z.string() }),
  z.object({ type: z.literal('AccessDenied'), error: z.string() }),
  z.object({
    type: z.literal('Success'),
    tokens: Auth0TokensSchema,
  }),
])

type LoginResponse = z.infer<typeof LoginResponse>

export const auth0Login = async (
  config: Config,
  input: LoginInput,
): Promise<LoginResponse> => {
  const logger = createLogger()
  try {
    const authClient = createAuthClient(config.authConfig)
    const result = await authClient.oauth.passwordGrant({
      username: input.email,
      password: input.password,
      audience: config.authConfig.AUTH_AUDIENCE,
      // scope:
      //   'read:events write:events read:me write:me read:users openid profile email offline_access',
      scope: 'openid profile email offline_access',
    })

    const tokens = Auth0TokensSchema.parse(result.data)

    return {
      type: 'Success',
      tokens,
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
      }
    }

    logger.withError(error).error('Login error occurred')
    return {
      type: 'UnknownError',
      error: 'An unknown error occurred during login.',
    }
  }
}
