import type { AuthConfig } from '~/common/auth0/auth-config'
import { getManagementClient } from '~/common/auth0/client'
import type { PaginationQuery } from '../shared-schema'
import { Auth0UserListResponseSchema } from './support/auth0-schema'
import { QUERY_USER_RETURNED_FIELDS } from './support/query-user-returned-fields'

export const listUsers = async (config: AuthConfig, params: PaginationQuery) => {
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
