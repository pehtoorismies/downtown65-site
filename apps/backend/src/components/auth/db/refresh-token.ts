import type { AuthConfig } from '~/common/auth0/auth-config'
import { createAuthClient } from '~/common/auth0/client'
import type { RefreshTokenInput } from '../shared-schema'
import { type Auth0TokensRefresh, Auth0TokensRefreshSchema } from './misc/auth0'

export const refreshToken = async (
  config: AuthConfig,
  input: RefreshTokenInput,
): Promise<Auth0TokensRefresh> => {
  try {
    const authClient = createAuthClient(config)
    const result = await authClient.oauth.refreshTokenGrant({
      refresh_token: input.refreshToken,
    })

    return Auth0TokensRefreshSchema.parse(result.data)
  } catch (error) {
    console.error(error)
    throw new Error('Token refresh failed')
  }
}
