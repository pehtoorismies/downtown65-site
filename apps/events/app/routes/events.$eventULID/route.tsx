import { EventSchema, stringToID } from '@downtown65/schema'
import { Box, Button, Container, Divider, Group } from '@mantine/core'
import {
  IconAlertTriangleFilled,
  IconCircleOff,
  IconPencil,
} from '@tabler/icons-react'
import { useState } from 'react'
import { Link, redirect } from 'react-router'
import { getApiClient } from '~/api/api-client'
import { EventCard } from '~/components/event/EventCard'
import { getEventTypeData } from '~/components/event/get-event-type-data'
import { AuthContext } from '~/context/context'
import { authMiddleware } from '~/middleware/auth-middleware'
import type { Route } from './+types/route'
import { DeleteModal } from './DeleteModal'
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

  const { event, origin } = loaderData
  const typeData = getEventTypeData(event.eventType)
  return [
    {
      title: event.title,
    },
    {
      content: 'website',
      property: 'og:type',
    },

    {
      content: `${origin}${location.pathname}`,
      property: 'og:url',
    },
    {
      content: `${event.title}`,
      property: 'og:title',
    },
    {
      content: `${event.dateStart} - ${event.subtitle}`,
      property: 'og:description',
    },
    {
      content: `${origin}${typeData.imageUrl}`,
      property: 'og:image',
    },
    {
      content: 'image/jpg',
      property: 'og:image:type',
    },
  ]
}

export const action = async ({ request, context }: Route.ActionArgs) => {
  const logger = context.logger.child()
  logger.withContext({ route: 'DELETE events' })

  if (request.method !== 'DELETE') {
    throw new Error(`Unsupported request method ${request.method}`)
  }
  const formData = await request.formData()
  const eventId = formData.get('eventId')
  logger.info(`Deleting event with eventId ${eventId}`)
  if (typeof eventId !== 'string') {
    throw new Error('eventId must be a string')
  }

  const eventIdDecoded = stringToID.decode(eventId)

  const authContext = context.get(AuthContext)
  if (!authContext) {
    return redirect('/login')
  }
  const { accessToken } = authContext
  const apiClient = getApiClient(context.cloudflare.env.API_HOST)
  const { error } = await apiClient.DELETE('/events/{id}', {
    headers: {
      authorization: `Bearer ${accessToken}`,
      'x-api-key': context.cloudflare.env.API_KEY,
    },
    params: {
      path: { id: stringToID.encode(eventIdDecoded) },
    },
  })

  if (error) {
    throw new Error('Failed to delete event')
  }

  return redirect('/events')
}

export async function loader({ context, params }: Route.LoaderArgs) {
  const authContext = context.get(AuthContext)
  const me = authContext ? authContext.user : null

  const apiClient = getApiClient(context.cloudflare.env.API_HOST)
  const { error, data } = await apiClient.GET('/events/{idOrULID}', {
    headers: {
      authorization: authContext
        ? `Bearer ${authContext.accessToken}`
        : undefined,
      'x-api-key': context.cloudflare.env.API_KEY,
    },
    params: {
      path: { idOrULID: params.eventULID },
    },
  })

  if (error) {
    throw new Response('Event not found', { status: 404 })
  }

  const event = EventSchema.parse(data)

  return {
    event,
    me,
    origin: 'http://localhost:3002',
  }
}

export default function GetEvent({ loaderData }: Route.ComponentProps) {
  const { event, me } = loaderData
  const [opened, setOpened] = useState(false)

  const onCloseModal = () => {
    setOpened(false)
  }

  return (
    <>
      <DeleteModal
        eventId={event.id}
        eventTitle={event.title}
        onCloseModal={onCloseModal}
        opened={opened}
      />

      <Container p={{ base: 1, sm: 'xs' }}>
        <EventBreadcrumbs title={event.title} />
        <EventCard event={event} me={me}>
          <EventButtonContainer
            eventId={event.id}
            me={me}
            participants={event.participants}
          />
        </EventCard>
        <Divider
          label={
            <>
              <IconAlertTriangleFilled size={12} />
              <Box ml={5}>Modification zone</Box>
            </>
          }
          labelPosition="center"
          mt="xl"
          size="sm"
          variant="dashed"
        />
        <Group gap="xl" justify="center" my="sm">
          <Button
            component={Link}
            data-testid="modify-event-btn"
            rightSection={<IconPencil size={18} />}
            to={`/events/${event.id}/edit/`}
          >
            Muokkaa
          </Button>
          <Button
            color="grape"
            data-testid="delete-event-btn"
            onClick={() => setOpened(true)}
            rightSection={<IconCircleOff size={18} />}
          >
            Poista tapahtuma
          </Button>
        </Group>
      </Container>
    </>
  )
}
