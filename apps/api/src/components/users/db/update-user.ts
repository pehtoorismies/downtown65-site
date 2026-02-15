import type { ID } from '@downtown65/schema'
import { eq } from 'drizzle-orm'
import type { RequestContext } from '~/app-api'
import { getDb } from '~/db/get-db'
import { users as usersTable } from '~/db/schema'
import type { UserUpdateParams } from '../shared-schema'

const getUpdateValuesForLocal = (params: UserUpdateParams) => {
  const values: Partial<Pick<UserUpdateParams, 'nickname' | 'picture'>> = {}
  if (params.nickname !== undefined) {
    values.nickname = params.nickname
  }
  if (params.picture !== undefined) {
    values.picture = params.picture
  }
  if (Object.keys(values).length === 0) {
    return undefined
  }
  return values
}

export const updateUser = async (
  ctx: RequestContext,
  id: ID,
  params: UserUpdateParams,
) => {
  const db = getDb(ctx.db)
  const localUpdateValues = getUpdateValuesForLocal(params)
  if (!localUpdateValues) {
    const user = await db.query.users.findFirst({
      columns: { auth0Sub: true },
      where: { id },
    })
    return user?.auth0Sub ?? null
  }

  const user = await db
    .update(usersTable)
    .set(localUpdateValues)
    .where(eq(usersTable.id, id))
    .returning()

  if (user.length === 1) {
    return user[0].auth0Sub
  }
  return null
}
