import { ISODateTimeSchema } from '@downtown65/schema'
import { Alert, Button, Center, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconAlertCircle, IconCircleOff } from '@tabler/icons-react'
import { useReducer } from 'react'
import { redirect } from 'react-router'
import { getApiClient } from '~/api/api-client'
import { CreateEventContainer } from '~/components/event/edit-or-create/CreateEventContainer'
import { EventFormSchema } from '~/components/event/edit-or-create/event-form-schema'
import { ModificationDivider } from '~/components/event/edit-or-create/ModificationDivider'
import { ActiveStep, reducer } from '~/components/event/edit-or-create/reducer'
import { AuthContext } from '~/context/context'
import { authMiddleware } from '~/middleware/auth-middleware'
import { CancelModal } from '../../components/event/edit-or-create/CancelModal'
import type { Route } from './+types/route'

export const middleware = [authMiddleware()]

export const action = async ({ context, request }: Route.ActionArgs) => {
  const authContext = context.get(AuthContext)
  if (!authContext) {
    return redirect('/login')
  }

  const formData = await request.formData()
  const parsed = EventFormSchema.safeParse(Object.fromEntries(formData))

  if (parsed.success === false) {
    return { errorMessage: 'Invalid form data' }
  }

  const apiClient = getApiClient(context.cloudflare.env.API_HOST)
  const { error, data } = await apiClient.POST('/events', {
    body: parsed.data,
    headers: {
      Authorization: `Bearer ${authContext.accessToken}`,
      'Content-Type': 'application/json',
      'x-api-key': context.cloudflare.env.API_KEY,
    },
  })

  if (error) {
    console.error('Error creating event:', error)
    return { errorMessage: 'Error creating event' }
  }

  return redirect(`/events/${data.eventULID}`)
}

export async function loader({ context }: Route.LoaderArgs) {
  const authContext = context.get(AuthContext)
  if (!authContext) {
    return redirect('/login')
  }

  return {
    me: authContext.user,
  }
}

export default function CreateEvent({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { me } = loaderData

  const meParticipant = {
    ...me,
    joinedAt: ISODateTimeSchema.parse(new Date().toISOString()),
  }

  const [opened, handlers] = useDisclosure(false)
  const [eventState, dispatch] = useReducer(reducer, {
    activeStep: ActiveStep.STEP_EVENT_TYPE,
    date: new Date(),
    description: '',
    isRace: false,
    kind: 'create',
    location: '',
    participants: [meParticipant],
    submitEvent: false,
    subtitle: '',
    time: {},
    title: '',
  })

  return (
    <>
      <Title order={1} size="h5">
        {actionData?.errorMessage}
      </Title>
      <CancelModal
        navigationPath="/events"
        onClose={handlers.close}
        opened={opened}
        title="Keskeytä tapahtuman luonti"
      />
      {actionData?.errorMessage && (
        <Alert
          color="red"
          icon={<IconAlertCircle size={16} />}
          mb="sm"
          title="Virhe luomisessa"
        >
          {actionData?.errorMessage}
        </Alert>
      )}
      <Title order={1} size="h5">
        Uusi tapahtuma: {eventState.title || 'ei nimeä'}
      </Title>
      <CreateEventContainer dispatch={dispatch} me={me} state={eventState} />
      <ModificationDivider />
      <Center>
        <Button
          color="red"
          data-testid="cancel-event-creation-button"
          my="md"
          onClick={handlers.open}
          rightSection={<IconCircleOff size={18} />}
        >
          Keskeytä luonti
        </Button>
      </Center>
    </>
  )
}
