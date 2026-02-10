import type { RequestContext } from '~/app-api'
import { getManagementClient } from '~/common/auth0/client'
import { Auth0UserListResponseSchema } from './support/auth0-schema'
import { QUERY_USER_RETURNED_FIELDS } from './support/query-user-returned-fields'

const toPage = (page: number) => (page > 0 ? page - 1 : 0)
const toLimit = (limit: number) => (limit > 0 ? limit : 1)

export const listUsers = async (
  ctx: RequestContext,
  params: { page: number; limit: number },
) => {
  const { page: paramPage, limit: paramLimit } = params

  const page = toPage(paramPage)
  const limit = toLimit(paramLimit)

  const management = await getManagementClient(ctx.authConfig)

  ctx.logger
    .withMetadata({ data: { limit, page } })
    .debug('Fetching users from Auth0')

  const { response } = await management.users.list({
    fields: QUERY_USER_RETURNED_FIELDS,
    include_totals: true,
    page,
    per_page: limit,
    sort: 'created_at:1',
  })

  return Auth0UserListResponseSchema.parse(response)
}
