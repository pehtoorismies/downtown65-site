import { getManagementClient } from '~/common/auth0/client'
import type { Config } from '~/common/config/config'
import { getDb } from '~/common/db/get-db'
import { usersTable } from '~/db/schema'
import { getUserId } from './get-user-id'
import { Auth0UserSchema } from './support/auth0-schema'
import { QUERY_USER_RETURNED_FIELDS } from './support/query-user-returned-fields'

export const getUser = async (config: Config, auth0Sub: string) => {
  const management = await getManagementClient(config.authConfig)

  const user = await management.users.get(auth0Sub, {
    fields: QUERY_USER_RETURNED_FIELDS,
  })

  if (!user) {
    return undefined
  }

  const auth0User = Auth0UserSchema.parse(user)

  const userId = await getUserId(config, auth0User.auth0Sub)

  if (userId != null) {
    return {
      ...auth0User,
      id: userId,
    }
  }

  const db = getDb(config.D1_DB)
  const inserted = await db
    .insert(usersTable)
    .values({
      auth0Sub: auth0User.auth0Sub,
      email: auth0User.email,
      nickname: auth0User.nickname,
      name: auth0User.name,
      picture: auth0User.picture,
      createdAt: auth0User.createdAt,
      updatedAt: auth0User.updatedAt,
    })
    .returning()

  return {
    ...auth0User,
    id: inserted[0].id,
  }
}
