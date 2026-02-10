import type { AppAPI } from '~/app-api'
import { register as registerGetMe } from './get-me'
import { register as registerGetUser } from './get-user'
import { register as registerGetUsers } from './get-users'
import { register as registerSyncUsers } from './post-sync-users'
import { register as registerPutMe } from './put-me'
import { register as registerPutUser } from './put-user'

export const registerRoutes = (app: AppAPI): void => {
  registerGetUsers(app)
  // Register /users/me BEFORE /users/{nickname} to avoid pattern matching issues
  registerGetMe(app)
  registerGetUser(app)
  registerPutMe(app)
  registerPutUser(app)
  registerSyncUsers(app)
}
