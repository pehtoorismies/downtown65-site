import { type MiddlewareFunction, redirect } from 'react-router'
import { AuthContext } from '~/context/context'
import { createSessionManager } from '~/session/session-manager.server'

export const authMiddleware =
  (allowAnonymous = false): MiddlewareFunction =>
  async ({ request, context }, next) => {
    const secrets = {
      COOKIE_SESSION_SECRET: context.cloudflare.env.COOKIE_SESSION_SECRET,
      API_KEY: context.cloudflare.env.API_KEY,
    }
    const sessionManager = createSessionManager(secrets)
    const result = await sessionManager.getUserSession(request)

    if (allowAnonymous && result.success === false) {
      context.set(AuthContext, null)
    } else if (result.success === false) {
      return redirect('/login', { headers: result.headers })
    } else {
      context.set(AuthContext, {
        user: result.user,
        accessToken: result.accessToken,
      })
    }
    const response = await next()
    response.headers.append('Set-Cookie', result.headers.get('Set-Cookie') || '')
    // response.headers.append("X-Request-Id", requestId);
    return response
  }
