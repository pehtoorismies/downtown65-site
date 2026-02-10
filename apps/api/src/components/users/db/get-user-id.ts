import type { Auth0Sub, ID } from '@downtown65/schema'
import type { RequestContext } from '~/app-api'
import { getDb } from '~/db/get-db'
export const getUserId = async (
  ctx: RequestContext,
  auth0Sub: Auth0Sub,
): Promise<ID | undefined> => {
  const db = getDb(ctx.db)
  const localUser = await db.query.users.findFirst({
    columns: { id: true },
    where: {
      auth0Sub,
    },
  })
  return !localUser ? undefined : localUser.id
}
