import { eq } from 'drizzle-orm'
import type { AuthConfig } from '~/common/auth0/auth-config'
import { getManagementClient } from '~/common/auth0/client'
import { getDb } from '~/components/events/db/get-db'
import { usersTable } from '~/db/schema'
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
  const userId = await db
    .select({
      id: usersTable.id,
    })
    .from(usersTable)
    .where(eq(usersTable.auth0Sub, auth0Sub))
    .limit(1)

  if (userId.length === 1 && userId[0].id != null) {
    return {
      ...auth0User,
      id: userId[0].id,
    }
  }

  if (userId.length === 0 || userId[0].id == null) {
    db.insert(usersTable).values({
      auth0Sub: auth0User.auth0Sub,
      email: user.email,
      nickname: user.nickname,
      name: user.name,
      picture: user.picture,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
  }

  return {
    ...auth0User,
    id: userId[0].id,
  }
}
