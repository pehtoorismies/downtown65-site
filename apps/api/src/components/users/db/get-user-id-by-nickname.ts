import type { RequestContext } from '~/app-api'
import { getDb } from '~/db/get-db'

export const getUserIdByNickname = async (
  ctx: RequestContext,
  nickname: string,
) => {
  const db = getDb(ctx.db)

  const localUser = await db.query.users.findFirst({
    columns: { id: true, sub: true },
    where: {
      nickname,
    },
  })

  if (localUser == null) {
    return null
  }

  return localUser
}
