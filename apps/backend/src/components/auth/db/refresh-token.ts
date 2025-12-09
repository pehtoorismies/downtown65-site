import { createAuthClient } from '~/common/auth0/client'
import type { Config } from '~/common/config/config'
import type { RefreshTokenInput } from '../shared-schema'
import { type Auth0TokensRefresh, Auth0TokensRefreshSchema } from './misc/auth0'

export const refreshToken = async (
  config: Config,
  input: RefreshTokenInput,
): Promise<Auth0TokensRefresh> => {
  try {
    const authClient = createAuthClient(config.authConfig)
    const result = await authClient.oauth.refreshTokenGrant({
      refresh_token: input.refreshToken,
    })

    return Auth0TokensRefreshSchema.parse(result.data)
  } catch (error) {
    console.error(error)
    throw new Error('Token refresh failed')
  }
}
