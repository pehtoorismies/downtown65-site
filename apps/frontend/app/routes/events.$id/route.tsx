import { Box, Button, Container, Divider, Group } from '@mantine/core'
import {
  IconAlertTriangleFilled,
  IconCircleOff,
  IconPencil,
} from '@tabler/icons-react'
import { Link, redirect } from 'react-router'
import { apiClient } from '~/api/api-client'
import { EventCard } from '~/components/event/EventCard'
import { getEventTypeData } from '~/components/event/get-event-type-data'
import { AuthContext } from '~/context/context'
import { authMiddleware } from '~/middleware/auth-middleware'
import type { Route } from './+types/route'
import { EventBreadcrumbs } from './EventBreadcrumbs'
import { EventButtonContainer } from './EventButtonContainer'

export const middleware = [authMiddleware({ allowAnonymous: true })]
export const meta = ({ loaderData, location }: Route.MetaArgs) => {
  if (!loaderData) {
    return [
      {
        title: 'Not found',
      },
    ]
  }

  const { eventItem, origin } = loaderData
  const typeData = getEventTypeData(eventItem.type)
  return [
    {
      title: eventItem.title,
    },
    {
      property: 'og:type',
      content: 'website',
    },

    {
      property: 'og:url',
      content: `${origin}${location.pathname}`,
    },
    {
      property: 'og:title',
      content: `${eventItem.title}`,
    },
    {
      property: 'og:description',
      content: `${eventItem.dateStart} - ${eventItem.subtitle}`,
    },
    {
      property: 'og:image',
      content: `${origin}${typeData.imageUrl}`,
    },
    {
      property: 'og:image:type',
      content: 'image/jpg',
    },
  ]
}

export const action = async ({
  request,
  params,
  context,
}: Route.ActionArgs) => {
  if (request.method !== 'DELETE') {
    throw new Error(`Unsupported request method ${request.method}`)
  }
  const id = +params.id

  if (Number.isNaN(id)) {
    throw new Error('Event ID must be a number')
  }

  const authContext = context.get(AuthContext)
  if (!authContext) {
    return redirect('/login')
  }
  const { accessToken } = authContext
  const { error } = await apiClient.DELETE('/events/{id}', {
    params: {
      path: { id },
    },
    headers: {
      'x-api-key': context.cloudflare.env.API_KEY,
      authorization: `Bearer ${accessToken}`,
    },
  })

  if (error) {
    throw new Error('Failed to delete event')
  }

  return redirect('/events')
}

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

export default function EventsList({ loaderData }: Route.ComponentProps) {
  const { eventItem, me } = loaderData

  return (
    <Container p={{ base: 1, sm: 'xs' }}>
      <EventBreadcrumbs title={eventItem.title} />
      <EventCard {...eventItem} me={me}>
        <EventButtonContainer
          participants={eventItem.participants}
          me={me}
          eventId={eventItem.id}
        />
      </EventCard>
      <Divider
        mt="xl"
        size="sm"
        variant="dashed"
        labelPosition="center"
        label={
          <>
            <IconAlertTriangleFilled size={12} />
            <Box ml={5}>Modification zone</Box>
          </>
        }
      />
      <Group justify="center" my="sm" gap="xl">
        <Button
          component={Link}
          to={`/events/edit/${eventItem.id}`}
          rightSection={<IconPencil size={18} />}
          data-testid="modify-event-btn"
        >
          Muokkaa
        </Button>
        <Button
          color="grape"
          // onClick={() => setOpened(true)}
          rightSection={<IconCircleOff size={18} />}
          data-testid="delete-event-btn"
        >
          Poista tapahtuma
        </Button>
      </Group>
    </Container>
  )
}
