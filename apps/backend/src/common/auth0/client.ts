import { AuthenticationClient, ManagementClient } from 'auth0'
import type { Config } from '../config/config'

export const createAuthClient = (authConfig: Config['authConfig']) => {
  return new AuthenticationClient({
    domain: authConfig.AUTH_DOMAIN,
    clientId: authConfig.AUTH_CLIENT_ID,
    clientSecret: authConfig.AUTH_CLIENT_SECRET,
  })
}

export const getManagementClient = async ({
  authConfig,
}: Config): Promise<ManagementClient> => {
  const authClient = createAuthClient(authConfig)
  const tokenResult = await authClient.oauth.clientCredentialsGrant({
    audience: `https://${authConfig.AUTH_DOMAIN}/api/v2/`,
  })

  return new ManagementClient({
    token: tokenResult.data.access_token,
    domain: authConfig.AUTH_DOMAIN,
  })
}
