import { AuthenticationClient, ManagementClient } from 'auth0'
import type { AuthConfig } from './auth-config'

export const createAuthClient = (config: AuthConfig) => {
  return new AuthenticationClient({
    domain: config.AUTH_DOMAIN,
    clientId: config.AUTH_CLIENT_ID,
    clientSecret: config.AUTH_CLIENT_SECRET,
  })
}

export const getManagementClient = async (config: AuthConfig): Promise<ManagementClient> => {
  const authClient = createAuthClient(config)
  const tokenResult = await authClient.oauth.clientCredentialsGrant({
    audience: `https://${config.AUTH_DOMAIN}/api/v2/`,
  })

  return new ManagementClient({
    token: tokenResult.data.access_token,
    domain: config.AUTH_DOMAIN,
  })
}
