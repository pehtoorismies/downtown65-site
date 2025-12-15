import {
  Anchor,
  Box,
  Breadcrumbs,
  Button,
  Container,
  Divider,
  Group,
  Text,
} from '@mantine/core'
import {
  IconAlertTriangleFilled,
  IconCircleOff,
  IconPencil,
} from '@tabler/icons-react'
import { Link, useFetcher } from 'react-router'
import {
  JoinEventButton,
  LeaveEventButton,
  ToLoginButton,
} from '~/components/event/EventButtons'
import { EventCard } from '~/components/event/EventCard'
import { getEventTypeData } from '~/components/event/get-event-type-data'
import { useParticipants } from '~/components/participants/use-participants'
import { AuthContext } from '~/context/context'
import { authMiddleware } from '~/middleware/auth-middleware'
import type { Route } from './+types/route'

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

const UserEventBreakcrumbs = ({ title }: { title: string }) => {
  const breadcrumbItems = [
    { title: 'Tapahtumat', href: '/events' },
    { title: title },
  ].map((item) => {
    return item.href ? (
      <Anchor component={Link} to={item.href} key={item.title}>
        {item.title}
      </Anchor>
    ) : (
      <Text key={item.title}>{item.title}</Text>
    )
  })
  return <Breadcrumbs mb="xs">{breadcrumbItems}</Breadcrumbs>
}

interface EventButtonProps {
  participants: { id: number }[]
  me: { id: number } | null
  eventId: number
}

const EventActionButton = (props: EventButtonProps) => {
  const { meAttending } = useParticipants(props.participants, props.me)
  const fetcher = useFetcher()

  if (!props.me) {
    return <ToLoginButton />
  }

  const isLoading =
    fetcher.state === 'loading' || fetcher.state === 'submitting'

  if (meAttending) {
    const leaveEvent = () => {
      fetcher.submit(
        {},
        {
          action: `/events/${props.eventId}/participation`,
          method: 'DELETE',
        },
      )
    }
    return (
      <LeaveEventButton {...props} onClick={leaveEvent} isLoading={isLoading} />
    )
  }

  const joinEvent = () => {
    fetcher.submit(
      {},
      {
        action: `/events/${props.eventId}/participation`,
        method: 'POST',
      },
    )
  }

  return (
    <JoinEventButton {...props} onClick={joinEvent} isLoading={isLoading} />
  )
}

export default function EventsList({ loaderData }: Route.ComponentProps) {
  const { eventItem, me } = loaderData

  return (
    <Container p={{ base: 1, sm: 'xs' }}>
      <UserEventBreakcrumbs title={eventItem.title} />
      <EventCard {...eventItem} me={me}>
        <EventActionButton
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
