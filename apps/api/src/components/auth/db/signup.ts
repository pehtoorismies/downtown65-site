import { type ID, IDSchema } from '@downtown65/schema'
import type { RequestContext } from '~/app-api'
import { getDb } from '~/db/get-db'
import { users as usersTable } from '~/db/schema'

type RegisterParams = {
  nickname: string
  sub: string
  picture: string
}

export const signup = async (
  ctx: RequestContext,
  params: RegisterParams,
): Promise<ID | null> => {
  const db = getDb(ctx.db)

  try {
    const result = await db
      .insert(usersTable)
      .values(params)
      .returning({ id: usersTable.id })
    return IDSchema.parse(result[0].id)
  } catch (error: unknown) {
    ctx.logger.withError(error).error('Error during local user creation')

    return null
  }
}
