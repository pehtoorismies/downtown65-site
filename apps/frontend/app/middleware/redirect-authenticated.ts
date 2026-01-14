import { type MiddlewareFunction, redirect } from 'react-router'
import { createSessionManager } from '~/session/session-manager.server'

export const redirectAuthenticatedMiddleware: MiddlewareFunction = async ({
  request,
  context,
}) => {
  const sessionManager = createSessionManager(context.cloudflare.env)
  const result = await sessionManager.getUserSession(request)

  if (result.success === true) {
    return redirect('/events', { headers: result.headers })
  }
}
