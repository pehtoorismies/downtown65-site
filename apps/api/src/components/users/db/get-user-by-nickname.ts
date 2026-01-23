import { getManagementClient } from '~/common/auth0/client'
import type { Config } from '~/common/config/config'
import { getUserId } from './get-user-id'
import { Auth0UserSchema } from './support/auth0-schema'
import { QUERY_USER_RETURNED_FIELDS } from './support/query-user-returned-fields'

export const getUserByNickname = async (config: Config, nickname: string) => {
  const management = await getManagementClient(config)

  const { data } = await management.users.list({
    q: `nickname:${nickname}`,
    fields: QUERY_USER_RETURNED_FIELDS,
    sort: 'created_at:1',
  })

  if (data.length > 1) {
    throw new Error('Multiple users found with the same nickname')
  }
  const auth0User = Auth0UserSchema.parse(data[0])

  const id = await getUserId(config, auth0User.auth0Sub)

  if (id == null) {
    throw new Error('User not found in the database but in external Auth0')
  }

  return {
    ...auth0User,
    id,
  }
}
