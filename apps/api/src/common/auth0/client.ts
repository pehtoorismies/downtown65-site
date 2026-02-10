import { AuthenticationClient, ManagementClient } from 'auth0'
import type { AuthConfig } from '../config/config'

export const createAuthClient = (authConfig: AuthConfig) => {
  return new AuthenticationClient(authConfig)
}

export const getManagementClient = async (
  authConfig: AuthConfig,
): Promise<ManagementClient> => {
  const authClient = createAuthClient(authConfig)
  const tokenResult = await authClient.oauth.clientCredentialsGrant({
    audience: `https://${authConfig.domain}/api/v2/`,
  })

  return new ManagementClient({
    domain: authConfig.domain,
    token: tokenResult.data.access_token,
  })
}
