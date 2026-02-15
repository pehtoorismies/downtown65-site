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
  auth0Sub: string,
  params: UserUpdateParams,
) => {
  const localUpdateValues = getUpdateValuesForLocal(params)
  if (!localUpdateValues) {
    return true
  }

  const db = getDb(ctx.db)

  await db
    .update(usersTable)
    .set(localUpdateValues)
    .where(eq(usersTable.auth0Sub, auth0Sub))
    .returning()

  return true
}
