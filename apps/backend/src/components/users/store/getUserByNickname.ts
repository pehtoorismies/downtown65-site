import type { AuthConfig } from '~/common/auth0/auth-config'
import { getManagementClient } from '~/common/auth0/client'
import { type User, UserSchema } from '../schema'

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

export const getUserByNickname =
  (config: AuthConfig) =>
  async (nickname: string): Promise<User | undefined> => {
    const management = await getManagementClient(config)

    const { data } = await management.users.list({
      q: `nickname:${nickname}`,
      fields: QUERY_USER_RETURNED_FIELDS,
      sort: 'created_at:1',
    })

    if (data.length > 1) {
      throw new Error('Multiple users found with the same nickname')
    }
    if (data.length === 1) {
      return UserSchema.parse(data[0])
    }

    return undefined
  }
