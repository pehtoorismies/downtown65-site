import type { RefreshTokenInput } from '../../routes/authRoutes'
import type { AuthConfig } from './misc/auth-config'
import { createAuthClient } from './misc/client'
import { type AuthTokens, authTokenSchema } from './misc/types'

export const refreshToken =
  (config: AuthConfig) =>
  async (input: RefreshTokenInput): Promise<AuthTokens> => {
    try {
      const authClient = createAuthClient(config)
      const result = await authClient.oauth.refreshTokenGrant({
        refresh_token: input.refreshToken,
      })
      return authTokenSchema.parse(result.data)
    } catch (error) {
      throw new Error('Token refresh failed')
    }
  }
