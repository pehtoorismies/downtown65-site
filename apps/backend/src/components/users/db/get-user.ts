import type { AuthConfig } from '~/common/auth0/auth-config'
import { getManagementClient } from '~/common/auth0/client'
import { Auth0UserSchema } from './support/auth0-schema'
import { QUERY_USER_RETURNED_FIELDS } from './support/query-user-returned-fields'

export const getUser = async (config: AuthConfig, auth0Sub: string) => {
  const management = await getManagementClient(config)

  const user = await management.users.get(auth0Sub, {
    fields: QUERY_USER_RETURNED_FIELDS,
  })

  return Auth0UserSchema.parse(user)
}
