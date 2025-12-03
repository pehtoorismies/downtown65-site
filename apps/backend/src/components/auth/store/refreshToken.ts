import type { AuthConfig } from '~/common/auth0/auth-config'
import { createAuthClient } from '~/common/auth0/client'
import type { RefreshTokenInput } from '../schema'
import { type Auth0Tokens, Auth0TokensSchema } from './misc/auth0'

export const refreshToken =
  (config: AuthConfig) =>
  async (input: RefreshTokenInput): Promise<Auth0Tokens> => {
    try {
      const authClient = createAuthClient(config)
      const result = await authClient.oauth.refreshTokenGrant({
        refresh_token: input.refreshToken,
      })
      console.log('Refresh token response', result.data)
      return Auth0TokensSchema.parse(result.data)
    } catch (error) {
      console.error(error)
      throw new Error('Token refresh failed')
    }
  }
