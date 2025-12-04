import { getAuthConfigFromEnv } from '~/common/auth0/auth-config'
import { forgotPassword } from './forgotPassword'
import { login } from './login'
import { refreshToken } from './refreshToken'
import { register } from './register'

export const createAuthStore = (env: Env) => {
  const config = getAuthConfigFromEnv(env)
  return {
    login: login(config),
    register: register(config),
    refreshToken: refreshToken(config),
    forgotPassword: forgotPassword(config),
  }
}
