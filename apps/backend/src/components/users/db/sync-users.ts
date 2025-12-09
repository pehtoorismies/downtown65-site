import { createLogger } from '@downtown65/logger'
import { eq } from 'drizzle-orm'
import z from 'zod'
import type { AuthConfig } from '~/common/auth0/auth-config'
import { getManagementClient } from '~/common/auth0/client'
import { getDb } from '~/components/events/db/get-db'
import { usersTable } from '~/db/schema'
import { Auth0UserSchema } from './support/auth0-schema'
import { QUERY_USER_RETURNED_FIELDS } from './support/query-user-returned-fields'

const Auth0UserListSchema = z.array(Auth0UserSchema)

export const syncUsers = async (config: AuthConfig, d1DB: D1Database) => {
  const management = await getManagementClient(config)
  const logger = createLogger()
  logger.info('Listing users from Auth0')

  const { response } = await management.users.list({
    fields: QUERY_USER_RETURNED_FIELDS,
    sort: 'created_at:1',
  })

  const users = response.users || []

  const db = getDb(d1DB)

  // TODO: missing updatedAt
  const userList = Auth0UserListSchema.parse(users)

  const nicknames = userList.map((u) => `${u.nickname}: ${u.email}`)
  logger.info(nicknames, 'Nicknames to sync')

  const createdUsers = []
  const updatedUsers = []

  // create async for loop to process users in sequence
  for (const user of userList) {
    const existing = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.auth0Sub, user.id))
      .limit(1)

    const isNew = existing.length === 0

    logger.info(`Syncing user (${isNew}): ${user.user_id} - ${user.email}`)
    await db
      .insert(usersTable)
      .values({
        auth0Sub: user.id,
        email: user.email,
        nickname: user.nickname,
        name: user.name,
        picture: user.picture,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .onConflictDoUpdate({
        target: usersTable.auth0Sub, // Unique column(s)
        set: {
          email: user.email,
          nickname: user.nickname,
          name: user.name,
          picture: user.picture,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      })

    logger.info(`${isNew ? 'Created' : 'Updated'} user ${user.email}`)
    if (isNew) {
      createdUsers.push(user)
    } else {
      updatedUsers.push(user)
    }
  }

  return { createdUsers, updatedUsers }
}
