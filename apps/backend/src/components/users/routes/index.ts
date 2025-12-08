import type { AppAPI } from '~/app-api'
import { register as registerGetMe } from './get-me'
import { register as registerGetUser } from './get-user'
import { register as registerGetUsers } from './get-users'
import { register as registerPutMe } from './put-me'

export const registerUserRoutes = (app: AppAPI): void => {
  registerGetUsers(app)
  registerGetUser(app)
  registerGetMe(app)
  registerPutMe(app)
}
