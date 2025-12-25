import { AuthContext } from '~/context/context'
import { authMiddleware } from '~/middleware/auth-middleware'
import type { Route } from './+types/route'

export const middleware = [authMiddleware()]

export async function loader({ context }: Route.LoaderArgs) {
  const authContext = context.get(AuthContext)
  const me = authContext ? authContext.user : null

  const event = {
    id: 1,
    title: 'Sample Event 1',
    dateStart: '2025-12-01',
    description: 'This is a sample event description.',
    location: 'Sample Location',
    participants: [],
    subtitle: 'Sample Subtitle',
    timeStart: '10:00',
    type: 'MEETING' as const,
    race: false,
    createdBy: {
      nickname: 'EventCreator',
    },
  }

  return { eventItem: event, me, origin: 'http://localhost:3002' }
}

export default function EditEvent({ loaderData }: Route.ComponentProps) {
  return <h1>Edit Event</h1>
}
