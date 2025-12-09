import { createLogger } from '@downtown65/logger'
import type { AuthConfig } from '~/common/auth0/auth-config'
import { getManagementClient } from '~/common/auth0/client'
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

export const updateUser = async (
  config: AuthConfig,
  auth0Sub: string,
  params: UserUpdateParams,
) => {
  const logger = createLogger()
  const management = await getManagementClient(config)
  const parsedParams = UpdateSchema.parse(params)
  logger.info(`Updating user ${auth0Sub} with params: ${JSON.stringify(parsedParams)}`)
  const response = await management.users.update(auth0Sub, parsedParams)
  logger.info(`Updated user ${auth0Sub} with params: ${JSON.stringify(response)}`)

  return Auth0UserSchema.parse(response)
}
