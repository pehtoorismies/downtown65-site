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
    const sessionManager = createSessionManager(context.cloudflare.env)
    const result = await sessionManager.getUserSession(request)

    if (result.success === false && allowAnonymous === false) {
      context.logger
        .withContext({ message: result.message })
        .info('User not authenticated, redirecting to /login')
      return redirect('/login', { headers: result.headers })
    }

    const authContextValue = result.success
      ? {
          accessToken: result.accessToken,
          user: result.user,
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
