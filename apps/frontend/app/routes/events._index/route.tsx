import { Container, Text, Title } from '@mantine/core'
import type { Route } from './+types/route'

export async function loader() {
  // TODO: Replace with actual API call
  const events = [
    { id: '1', title: 'Sample Event 1', date: '2025-12-01' },
    { id: '2', title: 'Sample Event 2', date: '2025-12-15' },
  ]
  return { events }
}

export default function EventsList({ loaderData }: Route.ComponentProps) {
  return (
    <Container>
      <Title>Events</Title>
      <Text>List of upcoming events:</Text>
      <ul>
        {loaderData.events.map((event) => (
          <li key={event.id}>
            <a href={`/events/${event.id}`}>
              {event.title} - {event.date}
            </a>
          </li>
        ))}
      </ul>
    </Container>
  )
}
