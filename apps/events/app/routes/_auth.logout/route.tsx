import { redirect } from 'react-router'
import { createSessionManager } from '~/session/session-manager.server'
import type { Route } from '../+types/$'

export const action = async ({ request, context }: Route.ActionArgs) => {
  const sessionManager = createSessionManager(context.cloudflare.env)
  const session = await sessionManager.getSession(request.headers.get('Cookie'))

  const headers = new Headers()
  headers.append('Set-Cookie', await sessionManager.destroySession(session))

  return redirect('/login', {
    headers,
  })
}
