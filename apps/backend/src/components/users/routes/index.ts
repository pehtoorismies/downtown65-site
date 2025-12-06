import type { AppAPI } from '~/app-api'
import { register as registerGetMe } from './getMe'
import { register as registerGetUser } from './getUser'
import { register as registerGetUsers } from './getUsers'
import { register as registerPutMe } from './putMe'

export const registerUserRoutes = (app: AppAPI): void => {
  registerGetUsers(app)
  registerGetUser(app)
  registerGetMe(app)
  registerPutMe(app)
}
