import type { AuthConfig } from '~/common/auth0/auth-config'
import { getManagementClient } from '~/common/auth0/client'
import { type DetailedUser, DetailedUserSchema } from '../schema'

const QUERY_USER_RETURNED_FIELDS = [
  'nickname',
  'name',
  'user_id',
  'picture',
  'email',
  'created_at',
  'app_metadata',
  'user_metadata',
].join(',')

export const getUser =
  (config: AuthConfig) =>
  async (auth0Sub: string): Promise<DetailedUser> => {
    const management = await getManagementClient(config)

    const user = await management.users.get(auth0Sub, {
      fields: QUERY_USER_RETURNED_FIELDS,
    })

    return DetailedUserSchema.parse(user)
  }
