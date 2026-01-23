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
import { createLogger } from '~/logger/logger.server'
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
      property: 'og:type',
      content: 'website',
    },

    {
      property: 'og:url',
      content: `${origin}${location.pathname}`,
    },
    {
      property: 'og:title',
      content: `${event.title}`,
    },
    {
      property: 'og:description',
      content: `${event.dateStart} - ${event.subtitle}`,
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

export const action = async ({ request, context }: Route.ActionArgs) => {
  const logger = createLogger({ appContext: 'Frontend Delete Event Action' })
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
    params: {
      path: { id: stringToID.encode(eventIdDecoded) },
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

export async function loader({ context, params }: Route.LoaderArgs) {
  const authContext = context.get(AuthContext)
  const me = authContext ? authContext.user : null

  const apiClient = getApiClient(context.cloudflare.env.API_HOST)
  const { error, data } = await apiClient.GET('/events/{idOrULID}', {
    params: {
      path: { idOrULID: params.eventULID },
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
        opened={opened}
        onCloseModal={onCloseModal}
        eventTitle={event.title}
        eventId={event.id}
      />

      <Container p={{ base: 1, sm: 'xs' }}>
        <EventBreadcrumbs title={event.title} />
        <EventCard event={event} me={me}>
          <EventButtonContainer
            participants={event.participants}
            me={me}
            eventId={event.id}
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
            to={`/events/${event.id}/edit/`}
            rightSection={<IconPencil size={18} />}
            data-testid="modify-event-btn"
          >
            Muokkaa
          </Button>
          <Button
            color="grape"
            onClick={() => setOpened(true)}
            rightSection={<IconCircleOff size={18} />}
            data-testid="delete-event-btn"
          >
            Poista tapahtuma
          </Button>
        </Group>
      </Container>
    </>
  )
}
