import { ISODateTimeSchema } from '@downtown65/schema'
import { Alert, Button, Center, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconAlertCircle, IconCircleOff } from '@tabler/icons-react'
import { useReducer } from 'react'
import { redirect } from 'react-router'
import { apiClient } from '~/api/api-client'
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

  const { error, data } = await apiClient.POST('/events', {
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
    location: '',
    participants: [meParticipant],
    submitEvent: false,
    subtitle: '',
    time: {},
    title: '',
    kind: 'create',
  })

  return (
    <>
      <Title order={1} size="h5">
        {actionData?.errorMessage}
      </Title>
      <CancelModal
        opened={opened}
        onClose={handlers.close}
        title="Keskeytä tapahtuman luonti"
        navigationPath="/events"
      />
      {actionData?.errorMessage && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Virhe luomisessa"
          color="red"
          mb="sm"
        >
          {actionData?.errorMessage}
        </Alert>
      )}
      <Title order={1} size="h5">
        Uusi tapahtuma: {eventState.title || 'ei nimeä'}
      </Title>
      <CreateEventContainer state={eventState} dispatch={dispatch} me={me} />
      <ModificationDivider />
      <Center>
        <Button
          my="md"
          color="red"
          rightSection={<IconCircleOff size={18} />}
          onClick={handlers.open}
          data-testid="cancel-event-creation-button"
        >
          Keskeytä luonti
        </Button>
      </Center>
    </>
  )
}
