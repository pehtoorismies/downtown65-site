import type { AuthConfig } from '~/common/auth0/auth-config'
import { getManagementClient } from '~/common/auth0/client'
import { getDb } from '~/components/events/db/get-db'
import { usersTable } from '~/db/schema'
import { getUserId } from './get-user-id'
import { Auth0UserSchema } from './support/auth0-schema'
import { QUERY_USER_RETURNED_FIELDS } from './support/query-user-returned-fields'

export const getUser = async (config: AuthConfig, d1DB: D1Database, auth0Sub: string) => {
  const management = await getManagementClient(config)

  const user = await management.users.get(auth0Sub, {
    fields: QUERY_USER_RETURNED_FIELDS,
  })

  if (!user) {
    return undefined
  }

  const auth0User = Auth0UserSchema.parse(user)

  const db = getDb(d1DB)
  const userId = await getUserId(d1DB, auth0User.auth0Sub)

  if (userId != null) {
    return {
      ...auth0User,
      id: userId,
    }
  }

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
