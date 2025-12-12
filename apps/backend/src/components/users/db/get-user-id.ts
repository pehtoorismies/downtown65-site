import { eq } from 'drizzle-orm'
import type { Config } from '~/common/config/config'
import { getDb } from '~/common/db/get-db'
import type { Auth0Sub, ID } from '~/common/schema'
import { usersTable } from '~/db/schema'

export const getUserId = async (
  config: Config,
  auth0Sub: Auth0Sub,
): Promise<ID | undefined> => {
  const db = getDb(config.D1_DB)
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
