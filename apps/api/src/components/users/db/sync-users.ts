import { eq } from 'drizzle-orm'
import z from 'zod'
import type { RequestContext } from '~/app-api'
import { getManagementClient } from '~/common/auth0/client'
import { getDb } from '~/db/get-db'
import { users as usersTable } from '~/db/schema'
import { Auth0UserSchema } from './support/auth0-schema'
import { QUERY_USER_RETURNED_FIELDS } from './support/query-user-returned-fields'

const Auth0UserListSchema = z.array(Auth0UserSchema)

export const syncUsers = async (ctx: RequestContext) => {
  const management = await getManagementClient(ctx.authConfig)
  ctx.logger.info('Listing users from Auth0')

  const { response } = await management.users.list({
    fields: QUERY_USER_RETURNED_FIELDS,
    sort: 'created_at:1',
  })

  const users = response.users || []

  const db = getDb(ctx.db)

  const userList = Auth0UserListSchema.parse(users)

  const createdUsers = []
  const existingUsers = []

  // create async for loop to process users in sequence
  for (const user of userList) {
    const existing = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.auth0Sub, user.auth0Sub))
      .limit(1)

    const isNew = existing.length === 0

    if (isNew) {
      ctx.logger
        .withMetadata({ data: user })
        .info(`Creating new user ${user.nickname}`)
      const createdUser = await db
        .insert(usersTable)
        .values({
          auth0Sub: user.auth0Sub,
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
