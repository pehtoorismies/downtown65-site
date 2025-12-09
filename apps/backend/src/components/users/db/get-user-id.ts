import { eq } from 'drizzle-orm'
import type { Auth0Sub, ID } from '~/common/schema'
import { getDb } from '~/components/events/db/get-db'
import { usersTable } from '~/db/schema'

export const getUserId = async (d1DB: D1Database, auth0Sub: Auth0Sub): Promise<ID | undefined> => {
  const db = getDb(d1DB)
  const userId = await db
    .select({
      id: usersTable.id,
    })
    .from(usersTable)
    .where(eq(usersTable.auth0Sub, auth0Sub))
    .limit(1)

  if (userId.length === 1 && userId[0].id != null) {
    return userId[0].id
  } else {
    return undefined
  }
}
