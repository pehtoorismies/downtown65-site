import { type MiddlewareFunction, redirect } from 'react-router'
import { createSessionManager } from '~/session/session-manager.server'

export const redirectAuthenticatedMiddleware: MiddlewareFunction = async ({
  request,
  context,
}) => {
  const secrets = {
    COOKIE_SESSION_SECRET: context.cloudflare.env.COOKIE_SESSION_SECRET,
    API_KEY: context.cloudflare.env.API_KEY,
  }
  const sessionManager = createSessionManager(secrets)
  const result = await sessionManager.getUserSession(request)

  if (result.success === true) {
    return redirect('/events', { headers: result.headers })
  }
}
