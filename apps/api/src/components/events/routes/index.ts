import type { AppAPI } from '~/app-api'
import { register as registerDeleteEvents } from './delete-events'
import { register as registerDeleteParticipants } from './delete-participants'
import { register as registerGetEvent } from './get-event'
import { register as registerGetEvents } from './get-events'
import { register as registerPostEvents } from './post-events'
import { register as registerPostParticipants } from './post-participants'
import { register as registerPutEvents } from './put-events'

export const registerRoutes = (app: AppAPI): void => {
  registerGetEvents(app)
  registerGetEvent(app)
  registerPostEvents(app)
  registerPutEvents(app)
  registerDeleteEvents(app)
  registerPostParticipants(app)
  registerDeleteParticipants(app)
}
