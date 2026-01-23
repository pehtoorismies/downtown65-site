import type { Auth0Sub, ID } from '@downtown65/schema'
import type { Config } from '~/common/config/config'
import { getDb } from '~/db/get-db'
export const getUserId = async (
  config: Config,
  auth0Sub: Auth0Sub,
): Promise<ID | undefined> => {
  const db = getDb(config.D1_DB)
  const localUser = await db.query.users.findFirst({
    where: {
      auth0Sub,
    },
    columns: { id: true },
  })
  return !localUser ? undefined : localUser.id
}
