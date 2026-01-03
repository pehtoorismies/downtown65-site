import { createLogger } from '@downtown65/logger'
import { type MiddlewareFunction, redirect } from 'react-router'
import { AuthContext } from '~/context/context'
import { createSessionManager } from '~/session/session-manager.server'

export const authMiddleware =
  ({
    allowAnonymous = false,
  }: {
    allowAnonymous?: boolean
  } = {}): MiddlewareFunction =>
  async ({ request, context }, next) => {
    const logger = createLogger({ appContext: 'Auth Middleware' })

    const secrets = {
      COOKIE_SESSION_SECRET: context.cloudflare.env.COOKIE_SESSION_SECRET,
      API_KEY: context.cloudflare.env.API_KEY,
    }
    const sessionManager = createSessionManager(secrets)
    const result = await sessionManager.getUserSession(request)

    if (result.success === false && allowAnonymous === false) {
      logger
        .withContext({ message: result.message })
        .info('User not authenticated, redirecting to /login')
      return redirect('/login', { headers: result.headers })
    }

    const authContextValue = result.success
      ? {
          user: result.user,
          accessToken: result.accessToken,
        }
      : null

    context.set(AuthContext, authContextValue)
    const response = (await next()) as Response
    response.headers.append(
      'Set-Cookie',
      result.headers.get('Set-Cookie') || '',
    )

    return response
  }
