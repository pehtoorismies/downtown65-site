import { Button } from '@mantine/core'
import { IconHandOff, IconHandStop, IconLogin } from '@tabler/icons-react'
import { Link } from 'react-router'
import { Gradient } from '../colors'

export const LeaveEventButton = (props: {
  isLoading: boolean
  onClick: () => void
}) => {
  return (
    <Button
      style={{ width: 140 }}
      onClick={props.onClick}
      loading={props.isLoading}
      leftSection={<IconHandOff size={18} />}
      variant="gradient"
      gradient={Gradient.dtPink}
      data-testid="leave"
      size="sm"
      // disabled={!actions.participationEnabled}
    >
      Poistu
    </Button>
  )
}
export const JoinEventButton = (props: {
  isLoading: boolean
  onClick: () => void
}) => {
  return (
    <Button
      style={{ width: 140 }}
      size="sm"
      onClick={props.onClick}
      loading={props.isLoading}
      leftSection={<IconHandStop size={18} />}
      data-testid="participate"
      // disabled={!actions.participationEnabled}
    >
      Osallistu
    </Button>
  )
}

export const ToLoginButton = () => {
  return (
    <Button
      component={Link}
      to="/login"
      leftSection={<IconLogin size={18} />}
      data-testid="event-goto-login"
      size="sm"
    >
      Kirjaudu
    </Button>
  )
}
