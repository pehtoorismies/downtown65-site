import { createLogger } from '@downtown65/logger'
import { eq } from 'drizzle-orm'
import { getManagementClient } from '~/common/auth0/client'
import type { Config } from '~/common/config/config'
import { getDb } from '~/db/get-db'
import { users as usersTable } from '~/db/schema'
import { type UserUpdateParams, UserUpdateParamsSchema } from '../shared-schema'

const UpdateSchema = UserUpdateParamsSchema.transform((obj) => {
  if (
    obj.subscribeEventCreationEmail === undefined &&
    obj.subscribeWeeklyEmail === undefined
  ) {
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
  config: Config,
  auth0Sub: string,
  params: UserUpdateParams,
) => {
  const logger = createLogger()
  const management = await getManagementClient(config)
  const parsedParams = UpdateSchema.parse(params)
  logger.info(
    `Updating user ${auth0Sub} with params: ${JSON.stringify(parsedParams)}`,
  )
  // TODO: handle errors
  const response = await management.users.update(auth0Sub, parsedParams)
  logger.info(
    `Updated user ${auth0Sub} with params: ${JSON.stringify(response)}`,
  )

  const localUpdateValues = getUpdateValuesForLocal(params)
  if (!localUpdateValues) {
    return true
  }

  const db = getDb(config.D1_DB)

  // just in case, update local user
  await db
    .update(usersTable)
    .set(localUpdateValues)
    .where(eq(usersTable.auth0Sub, auth0Sub))
    .returning()

  return true
}
