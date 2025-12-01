import { forgotPassword } from './forgotPassword'
import { login } from './login'
import { getAuthConfigFromEnv } from './misc/auth-config'
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

// export type {
//   AuthConfig,
//   AuthTokens,
//   User,
//   LoginResponse,
//   LoginSuccess,
//   InvalidCredentialsError,
//   AccessDeniedError,
//   UnknownError,
// } from './types'
