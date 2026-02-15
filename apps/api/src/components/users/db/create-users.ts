import { eq } from 'drizzle-orm'
import type { RequestContext } from '~/app-api'
import { getDb } from '~/db/get-db'
import { users as usersTable } from '~/db/schema'

type CreatableUser = {
  sub: string
  nickname: string
  picture: string
}

export const createUsers = async (
  ctx: RequestContext,
  users: CreatableUser[],
) => {
  const db = getDb(ctx.db)

  const createdUsers = []
  const existingUsers = []

  // create async for loop to process users in sequence
  for (const user of users) {
    const existing = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.auth0Sub, user.sub))
      .limit(1)

    const isNew = existing.length === 0

    if (isNew) {
      ctx.logger
        .withMetadata({ data: user })
        .info(`Creating new user ${user.nickname}`)
      const createdUser = await db
        .insert(usersTable)
        .values({
          auth0Sub: user.sub,
          nickname: user.nickname,
          picture: user.picture,
        })
        .returning({ id: usersTable.id })
      createdUsers.push({ createdUser })
    } else {
      ctx.logger.withMetadata({ data: user }).debug(`User exists already`)
      existingUsers.push({ existingUser: existing[0] })
    }
  }

  return {
    createdUsers: createdUsers.length,
    existingUsers: existingUsers.length,
  }
}
