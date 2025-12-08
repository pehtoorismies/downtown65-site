import type { AuthConfig } from '~/common/auth0/auth-config'
import { getManagementClient } from '~/common/auth0/client'
import { type UserUpdateParams, UserUpdateParamsSchema } from '../shared-schema'
import { Auth0UserSchema } from './support/auth0-schema'

const UpdateSchema = UserUpdateParamsSchema.transform((obj) => ({
  name: obj.name,
  nickname: obj.nickname,
  picture: obj.picture,
  user_metadata: {
    subscribeWeeklyEmail: obj.subscribeWeeklyEmail,
    subscribeEventCreationEmail: obj.subscribeEventCreationEmail,
  },
}))

export const updateUser = async (
  config: AuthConfig,
  auth0Sub: string,
  params: UserUpdateParams,
) => {
  const management = await getManagementClient(config)
  const parsedParams = UpdateSchema.parse(params)
  const response = await management.users.update(auth0Sub, parsedParams)

  return Auth0UserSchema.parse(response)
}
