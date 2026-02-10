import { AuthApiError } from 'auth0'
import { z } from 'zod'

import type { RequestContext } from '~/app-api'
import { createAuthClient } from '~/common/auth0/client'
import type { LoginInput } from '../shared-schema'
import { Auth0TokensSchema } from './support/auth0-schema'

const LoginResponse = z.discriminatedUnion('type', [
  z.object({ error: z.string(), type: z.literal('InvalidCredentials') }),
  z.object({ error: z.string(), type: z.literal('UnknownError') }),
  z.object({ error: z.string(), type: z.literal('AccessDenied') }),
  z.object({ tokens: Auth0TokensSchema, type: z.literal('Success') }),
])

type LoginResponse = z.infer<typeof LoginResponse>

export const auth0Login = async (
  ctx: RequestContext,
  input: LoginInput,
): Promise<LoginResponse> => {
  const logger = ctx.logger.child().withContext({ db: 'auth0Login' })
  logger.debug('Starting Auth0 login process')

  try {
    const authClient = createAuthClient(ctx.authConfig)
    const result = await authClient.oauth.passwordGrant({
      audience: ctx.authConfig.audience,
      password: input.password,
      // scope:
      //   'read:events write:events read:me write:me read:users openid profile email offline_access',
      scope: 'openid profile email offline_access',
      username: input.email,
    })

    const tokens = Auth0TokensSchema.parse(result.data)

    return {
      tokens,
      type: 'Success',
    }
  } catch (error: unknown) {
    if (error instanceof AuthApiError) {
      switch (error.error) {
        case 'invalid_grant':
          return {
            error: error.error_description,
            type: 'InvalidCredentials',
          }
        case 'access_denied':
          return {
            error: error.error_description,
            type: 'AccessDenied',
          }
      }
    }
    logger.withError(error).debug('An unknown error occurred during login.')
    return {
      error: 'An unknown error occurred during login.',
      type: 'UnknownError',
    }
  }
}
