import { type AuthConfig, getAuthConfigFromEnv } from '~/common/auth0/auth-config'
import { getUser } from './getUser'
import { getUserByNickname } from './getUserByNickname'
import { listUsers } from './listUsers'
import { updateUser } from './updateUser'

export interface UserStore {
  listUsers: ReturnType<typeof listUsers>
  getUser: ReturnType<typeof getUser>
  getUserByNickname: ReturnType<typeof getUserByNickname>
  updateUser: ReturnType<typeof updateUser>
}

export const createUsersStore = (env: Env): UserStore => {
  const config = getAuthConfigFromEnv(env)
  return {
    listUsers: listUsers(config),
    getUser: getUser(config),
    getUserByNickname: getUserByNickname(config),
    updateUser: updateUser(config),
  }
}
