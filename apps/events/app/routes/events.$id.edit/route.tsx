import { createLogger } from '@downtown65/logger'
import { EventSchema, type ISOTime } from '@downtown65/schema'
import { Alert, Button, Center, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconAlertCircle } from '@tabler/icons-react'
import { parse } from 'date-fns'
import { useReducer } from 'react'
import { redirect } from 'react-router'
import { getApiClient } from '~/api/api-client'
import { CancelModal } from '~/components/event/edit-or-create/CancelModal'
import { CreateEventContainer } from '~/components/event/edit-or-create/CreateEventContainer'
import { EventFormSchema } from '~/components/event/edit-or-create/event-form-schema'
import { ModificationDivider } from '~/components/event/edit-or-create/ModificationDivider'
import { ActiveStep, reducer } from '~/components/event/edit-or-create/reducer'
import { AuthContext } from '~/context/context'
import { authMiddleware } from '~/middleware/auth-middleware'
import type { Route } from './+types/route'

export const middleware = [authMiddleware()]

export const action = async ({
  context,
  request,
  params,
}: Route.ActionArgs) => {
  const logger = createLogger({
    appContext: 'Frontend: events.$id.edit action',
  })
  const authContext = context.get(AuthContext)
  if (!authContext) {
    return redirect('/login')
  }

  const formData = await request.formData()
  logger.withContext({ formData }).debug('Processing form data for event edit')
  const parsed = EventFormSchema.safeParse(Object.fromEntries(formData))
  logger.withContext({ parsed }).debug('Parsed form data')
  if (parsed.success === false) {
    return { errorMessage: 'Invalid form data' }
  }

  const apiClient = getApiClient(context.cloudflare.env.API_HOST)
  const { error } = await apiClient.PUT('/events/{id}', {
    params: {
      path: { id: params.id },
    },
    body: parsed.data,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authContext.accessToken}`,
      'x-api-key': context.cloudflare.env.API_KEY,
    },
  })

  if (error) {
    console.error('Error creating event:', error)
    return { errorMessage: 'Error creating event' }
  }

  return redirect(`/events/${params.id}`)
}

export async function loader({ context, params }: Route.LoaderArgs) {
  const authContext = context.get(AuthContext)

  if (!authContext) {
    return redirect('/login')
  }

  const apiClient = getApiClient(context.cloudflare.env.API_HOST)
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
    me: authContext.user,
  }
}

const toTimeComponents = (isoTime: ISOTime | null) => {
  if (isoTime === null) {
    return {}
  }
  const [hoursStr, minutesStr] = isoTime.split(':')
  const date = new Date()
  date.setHours(Number(hoursStr), Number(minutesStr), 0, 0)
  return {
    hours: date.getHours(),
    minutes: date.getMinutes(),
  }
}

export default function EditEvent({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { me, event } = loaderData

  const [opened, handlers] = useDisclosure(false)
  const [eventState, dispatch] = useReducer(reducer, {
    activeStep: ActiveStep.STEP_EVENT_TYPE,
    eventType: event.eventType,
    date: parse(event.dateStart, 'yyyy-MM-dd', new Date()),
    description: event.description ?? '',
    isRace: event.race,
    location: event.location,
    participants: event.participants || [],
    submitEvent: false,
    subtitle: event.subtitle,
    time: toTimeComponents(event.timeStart),
    title: event.title,
    kind: 'edit',
  })

  return (
    <>
      <CancelModal
        opened={opened}
        onClose={handlers.close}
        title="Keskeytä tapahtuman muokkaus"
        navigationPath={`/events/${event.id}`}
      />
      {actionData?.errorMessage && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Virhe muokkauksessa"
          color="red"
          mb="sm"
        >
          {actionData?.errorMessage}
        </Alert>
      )}
      <Title order={1} size="h5">
        Muokkaa tapahtumaa: {eventState.title}
      </Title>
      <CreateEventContainer state={eventState} dispatch={dispatch} me={me} />
      <ModificationDivider />
      <Center>
        <Button
          my="md"
          color="red"
          rightSection={<IconAlertCircle size={18} />}
          onClick={handlers.open}
          data-testid="cancel-event-editing-button"
        >
          Keskeytä muokkaus
        </Button>
      </Center>
    </>
  )
}
