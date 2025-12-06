import type { AuthConfig } from '~/common/auth0/auth-config'
import { getManagementClient } from '~/common/auth0/client'
import { Auth0UserListResponseSchema, type PaginationQuery } from './schema'

const QUERY_USER_RETURNED_FIELDS = [
  'nickname',
  'name',
  'user_id',
  'picture',
  'email',
  'created_at',
  'role',
].join(',')

export const getUsers = (config: AuthConfig) => async (params: PaginationQuery) => {
  const { page, limit } = params
  const management = await getManagementClient(config)

  const { response } = await management.users.list({
    page: page,
    per_page: limit,
    include_totals: true,
    fields: QUERY_USER_RETURNED_FIELDS,
    sort: 'created_at:1',
  })

  return Auth0UserListResponseSchema.parse(response)
}
