import { createLogger } from '@downtown65/logger'
import { eq } from 'drizzle-orm'
import z from 'zod'
import { getManagementClient } from '~/common/auth0/client'
import type { Config } from '~/common/config/config'
import { getDb } from '~/db/get-db'
import { users as usersTable } from '~/db/schema'
import { Auth0UserSchema } from './support/auth0-schema'
import { QUERY_USER_RETURNED_FIELDS } from './support/query-user-returned-fields'

const Auth0UserListSchema = z.array(Auth0UserSchema)

export const syncUsers = async (config: Config) => {
  const management = await getManagementClient(config)
  const logger = createLogger()
  logger.info('Listing users from Auth0')

  const { response } = await management.users.list({
    fields: QUERY_USER_RETURNED_FIELDS,
    sort: 'created_at:1',
  })

  const users = response.users || []

  const db = getDb(config.D1_DB)

  const userList = Auth0UserListSchema.parse(users)

  const nicknames = userList.map((u) => `${u.nickname}: ${u.email}`)
  logger.withMetadata(nicknames).info('Nicknames to sync')

  const createdUsers = []
  const updatedUsers = []

  // create async for loop to process users in sequence
  for (const user of userList) {
    const existing = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.auth0Sub, user.auth0Sub))
      .limit(1)

    const isNew = existing.length === 0

    logger.info(`Syncing user (${isNew}): ${user.user_id} - ${user.email}`)
    const upsertedUser = await db
      .insert(usersTable)
      .values({
        auth0Sub: user.auth0Sub,
        nickname: user.nickname,
        picture: user.picture,
      })
      .onConflictDoUpdate({
        target: usersTable.auth0Sub, // Unique column(s)
        set: {
          nickname: user.nickname,
          picture: user.picture,
        },
      })
      .returning({ id: usersTable.id })

    logger.info(`${isNew ? 'Created' : 'Updated'} user ${user.email}`)
    if (isNew) {
      createdUsers.push({ ...user, id: upsertedUser[0].id })
    } else {
      updatedUsers.push({ ...user, id: upsertedUser[0].id })
    }
  }

  return { createdUsers, updatedUsers }
}
