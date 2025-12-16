import { Box, Button, Container, Divider, Group } from '@mantine/core'
import {
  IconAlertTriangleFilled,
  IconCircleOff,
  IconPencil,
} from '@tabler/icons-react'
import { useState } from 'react'
import { Link, redirect } from 'react-router'
import { apiClient } from '~/api/api-client'
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

export const action = async ({ request, context }: Route.ActionArgs) => {
  const logger = createLogger({ appContext: 'Frontend Delete Event Action' })
  if (request.method !== 'DELETE') {
    throw new Error(`Unsupported request method ${request.method}`)
  }
  const formData = await request.formData()
  const eventId = formData.get('eventId')
  logger.info(`Deleting event with eventId ${eventId}`)

  const id = Number(eventId)
  if (Number.isNaN(id)) {
    throw new Error('Invalid event ID')
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

export async function loader({ context, params }: Route.LoaderArgs) {
  const authContext = context.get(AuthContext)
  const me = authContext ? authContext.user : null

  const { error, data } = await apiClient.GET('/events/{eventULID}', {
    params: {
      path: { eventULID: params.eventULID },
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

  return {
    eventItem: {
      ...data,
      dateStart: data.date,
      participants: [],
    },
    me,
    origin: 'http://localhost:3002',
  }
}

export default function GetEvent({ loaderData }: Route.ComponentProps) {
  const { eventItem, me } = loaderData
  const [opened, setOpened] = useState(false)

  const onCloseModal = () => {
    setOpened(false)
  }

  return (
    <>
      <DeleteModal
        opened={opened}
        onCloseModal={onCloseModal}
        eventTitle={eventItem.title}
        eventId={eventItem.id}
      />

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
            to={`/events/${eventItem.id}/edit/`}
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
