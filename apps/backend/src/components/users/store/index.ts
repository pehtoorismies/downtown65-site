import { type AuthConfig, getAuthConfigFromEnv } from '~/common/auth0/auth-config'
import { getUser } from './getUser'
import { getUserByNickname } from './getUserByNickname'
import { listUsers } from './listUsers'

export interface UserStore {
  listUsers: ReturnType<typeof listUsers>
}

export const createUsersStore = (env: Env) => {
  const config = getAuthConfigFromEnv(env)
  return {
    listUsers: listUsers(config),
    getUser: getUser(config),
    getUserByNickname: getUserByNickname(config),
  }
}
