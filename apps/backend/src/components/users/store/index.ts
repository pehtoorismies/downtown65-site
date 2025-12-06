import { type AuthConfig, getAuthConfigFromEnv } from '~/common/auth0/auth-config'
import { getUser } from './getUser'
import { getUserByNickname } from './getUserByNickname'
import { getUsers } from './getUsers'
import { updateUser } from './updateUser'

export interface UserStore {
  getUsers: ReturnType<typeof getUsers>
  getUser: ReturnType<typeof getUser>
  getUserByNickname: ReturnType<typeof getUserByNickname>
  updateUser: ReturnType<typeof updateUser>
}

export const createUsersStore = (env: Env): UserStore => {
  const config = getAuthConfigFromEnv(env)
  return {
    getUsers: getUsers(config),
    getUser: getUser(config),
    getUserByNickname: getUserByNickname(config),
    updateUser: updateUser(config),
  }
}
