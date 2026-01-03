import type { AppAPI } from '~/app-api'
import { register as registerAuth0Login } from './auth0-login'
import { register as registerForgotPassword } from './forgot-password'
import { register as registerLogin } from './login'
import { register as registerRefreshToken } from './refresh-token'
import { register as registerRegister } from './signup'

export const registerRoutes = (app: AppAPI): void => {
  registerAuth0Login(app)
  registerLogin(app)
  registerRegister(app)
  registerForgotPassword(app)
  registerRefreshToken(app)
}
