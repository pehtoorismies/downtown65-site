import { EventSchema } from '@downtown65/schema'
import { apiClient } from '~/api/api-client'
import { AuthContext } from '~/context/context'
import { authMiddleware } from '~/middleware/auth-middleware'
import type { Route } from './+types/route'

export const middleware = [authMiddleware()]

export async function loader({ context, params }: Route.LoaderArgs) {
  const authContext = context.get(AuthContext)
  const me = authContext ? authContext.user : null

  const { error, data } = await apiClient.GET('/events/{idOrULID}', {
    params: {
      path: { idOrULID: params.id },
    },
    headers: {
      'x-api-key': context.cloudflare.env.API_KEY,
      authorization: authContext
        ? `Bearer ${authContext.accessToken}`
        : undefined,
    },
  })

  if (error) {
    throw new Response('Event not found', { status: 404 })
  }

  const event = EventSchema.parse(data)

  return {
    event,
    me,
  }
}

export default function EditEvent({ loaderData }: Route.ComponentProps) {
  return <h1>Edit Event {loaderData.event.title}</h1>
}
