import { createLogger } from '@downtown65/logger'
import { getManagementClient } from '~/common/auth0/client'
import type { Config } from '~/common/config/config'
import { Auth0UserListResponseSchema } from './support/auth0-schema'
import { QUERY_USER_RETURNED_FIELDS } from './support/query-user-returned-fields'

const toPage = (page: number) => (page > 0 ? page - 1 : 0)
const toLimit = (limit: number) => (limit > 0 ? limit : 1)

export const listUsers = async (
  config: Config,
  params: { page: number; limit: number },
) => {
  const logger = createLogger({ appContext: 'DB: List Users' })
  const { page: paramPage, limit: paramLimit } = params

  const page = toPage(paramPage)
  const limit = toLimit(paramLimit)

  const management = await getManagementClient(config)

  logger
    .withMetadata({ data: { page, limit } })
    .debug('Fetching users from Auth0')

  const { response } = await management.users.list({
    page,
    per_page: limit,
    include_totals: true,
    fields: QUERY_USER_RETURNED_FIELDS,
    sort: 'created_at:1',
  })

  return Auth0UserListResponseSchema.parse(response)
}
