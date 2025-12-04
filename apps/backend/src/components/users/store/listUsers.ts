import type { AuthConfig } from '~/common/auth0/auth-config'
import { getManagementClient } from '~/common/auth0/client'
import { type PaginationQuery, type UserList, UserSchema } from '../schema'

const QUERY_USER_RETURNED_FIELDS = [
  'nickname',
  'name',
  'user_id',
  'picture',
  'email',
  'created_at',
  'role',
].join(',')

export const listUsers =
  (config: AuthConfig) =>
  async (params: PaginationQuery): Promise<UserList> => {
    const { page, limit } = params
    const management = await getManagementClient(config)

    const { data } = await management.users.list({
      page: page,
      per_page: limit,
      include_totals: true,
      fields: QUERY_USER_RETURNED_FIELDS,
      sort: 'created_at:1',
    })
    console.log(data[0])
    return data.map((user) => UserSchema.parse(user))
  }
