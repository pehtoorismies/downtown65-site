import {
  Breadcrumbs,
  Button,
  Center,
  Container,
  Text,
  Title,
} from '@mantine/core'
import { IconSquarePlus } from '@tabler/icons-react'
import type { PropsWithChildren } from 'react'
import { Link, NavLink, redirect } from 'react-router'
import { apiClient } from '~/api/api-client'
import { AuthContext } from '~/context/context'
import { authMiddleware } from '~/middleware/auth-middleware'
import type { Route } from './+types/route'

export const middleware = [authMiddleware()]

export async function loader({ context }: Route.LoaderArgs) {
  const authContext = context.get(AuthContext)
  if (!authContext) {
    return redirect('/login')
  }

  const { accessToken, user } = authContext

  const { data, error } = await apiClient.GET('/events', {
    headers: {
      authorization: `Bearer ${accessToken}`,
      'x-api-key': context.cloudflare.env.API_KEY,
    },
  })

  if (error) {
    throw new Error('Failed to load events list')
  }

  return { events: data, user }
}

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <Container data-testid="events" p={{ base: 1, sm: 'xs' }} size="1000">
      <Breadcrumbs mb="xs">
        <Text data-testid="breadcrumbs-current">Tapahtumat</Text>
      </Breadcrumbs>
      {children}
    </Container>
  )
}

export default function EventsList({ loaderData }: Route.ComponentProps) {
  const { events, user } = loaderData

  if (events.length === 0) {
    return (
      <Layout>
        <Title order={1} ta="center">
          Ei tulevia tapahtumia
        </Title>
        <Center>
          <Button
            component={Link}
            to="/events/new"
            size="lg"
            mt="xs"
            rightSection={<IconSquarePlus size={30} />}
          >
            Luo uusi tapahtuma
          </Button>
        </Center>
      </Layout>
    )
  }

  return (
    <Container>
      <Title>Tapahtumat</Title>
      <Text>Tulevat tapahtumat:</Text>
      <ul>
        {loaderData.events.map((event) => (
          <li key={event.id}>
            <NavLink to={`/events/${event.eventULID}`}>
              {event.title} - {event.date}
            </NavLink>
          </li>
        ))}
      </ul>
    </Container>
  )
}
