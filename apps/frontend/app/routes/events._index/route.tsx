import { EventListSchema } from '@downtown65/schema'
import {
  Breadcrumbs,
  Button,
  Center,
  SimpleGrid,
  Text,
  Title,
} from '@mantine/core'
import { IconSquarePlus } from '@tabler/icons-react'
import type { PropsWithChildren } from 'react'
import { Link, redirect } from 'react-router'
import { getApiClient } from '~/api/api-client'
import { AuthContext } from '~/context/context'
import { authMiddleware } from '~/middleware/auth-middleware'
import { EventButtonContainer } from '../events.$eventULID/EventButtonContainer'
import type { Route } from './+types/route'
import { ListEventCard } from './ListEventCard'

export const middleware = [authMiddleware()]

export async function loader({ context }: Route.LoaderArgs) {
  const authContext = context.get(AuthContext)
  if (!authContext) {
    return redirect('/login')
  }

  const { accessToken, user } = authContext

  const apiClient = getApiClient(context.cloudflare.env.API_HOST)
  const { data, error } = await apiClient.GET('/events', {
    headers: {
      authorization: `Bearer ${accessToken}`,
      'x-api-key': context.cloudflare.env.API_KEY,
    },
  })

  if (error) {
    throw new Error('Failed to load events list')
  }

  return { events: EventListSchema.parse(data), user }
}

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <Breadcrumbs mb="xs">
        <Text data-testid="breadcrumbs-current">Tapahtumat</Text>
      </Breadcrumbs>
      {children}
    </>
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
    <Layout>
      <Title>Tulevat tapahtumat</Title>
      <SimpleGrid
        cols={{ base: 1, sm: 2 }}
        spacing={{ base: 'sm', md: 'xl' }}
        verticalSpacing={{ base: 'sm', md: 'xl' }}
      >
        {events.map((x) => {
          return (
            <ListEventCard key={x.id} event={x} me={user}>
              <EventButtonContainer
                participants={x.participants}
                me={user}
                eventId={x.id}
              />
            </ListEventCard>
          )
        })}
      </SimpleGrid>
    </Layout>
  )
}
