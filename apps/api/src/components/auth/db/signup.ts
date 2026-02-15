import { Auth0SubSchema, type ID, IDSchema } from '@downtown65/schema'
import z from 'zod'
import type { RequestContext } from '~/app-api'
import { getDb } from '~/db/get-db'
import { users as usersTable } from '~/db/schema'

const LocalUserSchema = z.object({
  auth0Sub: Auth0SubSchema,
  nickname: z.string(),
  picture: z.httpUrl(),
})

type LocalUser = z.infer<typeof LocalUserSchema>

const createLocalUser = async (ctx: RequestContext, values: LocalUser) => {
  const db = getDb(ctx.db)
  try {
    const result = await db
      .insert(usersTable)
      .values(values)
      .returning({ id: usersTable.id })
    return result[0].id
  } catch (error: unknown) {
    ctx.logger.withError(error).error('Error during local user creation')

    return null
  }
}

type RegisterParams = {
  nickname: string
  sub: string
  picture: string
}

export const signup = async (
  ctx: RequestContext,
  params: RegisterParams,
): Promise<ID | null> => {
  const localUserId = await createLocalUser(
    ctx,
    LocalUserSchema.decode({
      ...params,
      auth0Sub: params.sub,
    }),
  )

  if (!localUserId) {
    return null
  }

  return IDSchema.parse(localUserId)
}
