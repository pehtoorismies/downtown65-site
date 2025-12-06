import z from 'zod'
import type { AuthConfig } from '~/common/auth0/auth-config'
import { getManagementClient } from '~/common/auth0/client'
import { DetailedAuth0UserSchema, type UserUpdateParams, UserUpdateParamsSchema } from './schema'

const UpdateSchema = UserUpdateParamsSchema.transform((obj) => ({
  name: obj.name,
  nickname: obj.nickname,
  picture: obj.picture,
  user_metadata: {
    subscribeWeeklyEmail: obj.subscribeWeeklyEmail,
    subscribeEventCreationEmail: obj.subscribeEventCreationEmail,
  },
}))

export const updateUser =
  (config: AuthConfig) => async (auth0Sub: string, params: UserUpdateParams) => {
    const management = await getManagementClient(config)
    const parsedParams = UpdateSchema.parse(params)
    const response = await management.users.update(auth0Sub, parsedParams)

    return DetailedAuth0UserSchema.parse(response)
  }
