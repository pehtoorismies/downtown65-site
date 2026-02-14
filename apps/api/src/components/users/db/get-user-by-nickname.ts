import type { RequestContext } from '~/app-api'
import { getManagementClient } from '~/common/auth0/client'
import { getUserId } from './get-user-id'
import { Auth0UserSchema } from './support/auth0-schema'
import { QUERY_USER_RETURNED_FIELDS } from './support/query-user-returned-fields'

export const getUserByNickname = async (
  ctx: RequestContext,
  nickname: string,
) => {
  const logger = ctx.logger.child()
  const management = await getManagementClient(ctx.authConfig)

  const { data } = await management.users.list({
    fields: QUERY_USER_RETURNED_FIELDS,
    q: `nickname:${nickname}`,
    sort: 'created_at:1',
  })

  logger
    .withMetadata({ auth0Results: data, nickname })
    .debug('Queried Auth0 for user by nickname')

  if (data.length === 0) {
    return undefined
  }

  if (data.length > 1) {
    throw new Error('Multiple users found with the same nickname')
  }

  const auth0User = Auth0UserSchema.parse(data[0])

  const id = await getUserId(ctx, auth0User.auth0Sub)

  if (id == null) {
    throw new Error('User not found in the database but in external Auth0')
  }

  return {
    ...auth0User,
    id,
  }
}
