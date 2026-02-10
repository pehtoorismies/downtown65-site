import type { RequestContext } from '~/app-api'
import { createAuthClient } from '~/common/auth0/client'
import type { RefreshTokenInput } from '../shared-schema'
import {
  type Auth0TokensRefresh,
  Auth0TokensRefreshSchema,
} from './support/auth0-schema'

export const refreshToken = async (
  ctx: RequestContext,
  input: RefreshTokenInput,
): Promise<Auth0TokensRefresh> => {
  try {
    const authClient = createAuthClient(ctx.authConfig)
    const result = await authClient.oauth.refreshTokenGrant({
      refresh_token: input.refreshToken,
    })

    return Auth0TokensRefreshSchema.parse(result.data)
  } catch (error) {
    ctx.logger.withError(error as Error).error('Token refresh failed')
    throw new Error('Token refresh failed')
  }
}
