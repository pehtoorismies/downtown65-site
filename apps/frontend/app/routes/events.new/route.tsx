import { Box, Button, Center, Divider, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconAlertTriangleFilled, IconCircleOff } from '@tabler/icons-react'
import { useReducer } from 'react'
import { authMiddleware } from '~/middleware/auth-middleware'
import type { Route } from './+types/route'
import { CreateEventContainer } from './CreateEventContainer'
import { ActiveStep, reducer } from './reducer'

export const middleware = [authMiddleware()]

export async function loader() {
  // TODO: Replace with actual API call
  const events = [
    { id: '1', title: 'Sample Event 1', date: '2025-12-01' },
    { id: '2', title: 'Sample Event 2', date: '2025-12-15' },
  ]
  return {
    events,
    me: {
      nickname: 'johndoe',
      id: 1,
      auth0Sub: 'auth0|asasd',
      picture: 'https://asdfasdf',
    },
  }
}

export default function CreateEvent({ loaderData }: Route.ComponentProps) {
  const { me } = loaderData
  const [_opened, handlers] = useDisclosure(false)
  const [eventState, dispatch] = useReducer(reducer, {
    activeStep: ActiveStep.STEP_EVENT_TYPE,
    date: new Date(),
    description: '',
    isRace: false,
    location: '',
    participants: [],
    submitEvent: false,
    subtitle: '',
    time: {},
    title: '',
    kind: 'create',
  })

  return (
    <>
      <Title order={1} size="h5">
        Uusi tapahtuma: {eventState.title || 'ei nimeä'}
      </Title>
      <CreateEventContainer
        state={eventState}
        dispatch={dispatch}
        me={me}
        cancelRedirectPath="koira"
      />
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
