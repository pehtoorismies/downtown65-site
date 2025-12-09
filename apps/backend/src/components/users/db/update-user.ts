import { createLogger } from '@downtown65/logger'
import { eq } from 'drizzle-orm'
import { getManagementClient } from '~/common/auth0/client'
import type { Config } from '~/common/config/config'
import { getDb } from '~/common/db/get-db'
import { usersTable } from '~/db/schema'
import { type UserUpdateParams, UserUpdateParamsSchema } from '../shared-schema'
import { Auth0UserSchema } from './support/auth0-schema'

const UpdateSchema = UserUpdateParamsSchema.transform((obj) => {
  if (obj.subscribeEventCreationEmail === undefined && obj.subscribeWeeklyEmail === undefined) {
    return {
      name: obj.name,
      nickname: obj.nickname,
      picture: obj.picture,
    }
  }

  return {
    name: obj.name,
    nickname: obj.nickname,
    picture: obj.picture,
    user_metadata: {
      subscribeWeeklyEmail: obj.subscribeWeeklyEmail,
      subscribeEventCreationEmail: obj.subscribeEventCreationEmail,
    },
  }
})

export const updateUser = async (config: Config, auth0Sub: string, params: UserUpdateParams) => {
  const logger = createLogger()
  const management = await getManagementClient(config.authConfig)
  const parsedParams = UpdateSchema.parse(params)
  logger.info(`Updating user ${auth0Sub} with params: ${JSON.stringify(parsedParams)}`)
  const response = await management.users.update(auth0Sub, parsedParams)
  logger.info(`Updated user ${auth0Sub} with params: ${JSON.stringify(response)}`)

  const auth0User = Auth0UserSchema.parse(response)

  const db = getDb(config.D1_DB)

  const updated = await db
    .update(usersTable)
    .set({
      nickname: auth0User.nickname,
      name: auth0User.name,
      picture: auth0User.picture,
      updatedAt: auth0User.updatedAt,
    })
    .where(eq(usersTable.auth0Sub, auth0Sub))
    .returning()

  return {
    ...auth0User,
    id: updated[0].id,
  }
}
