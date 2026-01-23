import { Button } from '@mantine/core'
import { IconHandOff, IconHandStop, IconLogin } from '@tabler/icons-react'
import { Link } from 'react-router'
import { Gradient } from '../colors'

type ParticipationProps = {
  isLoading: boolean
  onClick: () => void
  title?: string
}

export const LeaveEventButton = ({
  title = 'Poistu',
  isLoading,
  onClick,
}: ParticipationProps) => {
  return (
    <Button
      style={{ width: 140 }}
      onClick={onClick}
      loading={isLoading}
      leftSection={<IconHandOff size={18} />}
      variant="gradient"
      gradient={Gradient.dtPink}
      data-testid="leave"
      size="sm"
      // disabled={!actions.participationEnabled}
    >
      {title}
    </Button>
  )
}
export const JoinEventButton = ({
  title = 'Osallistu',
  isLoading,
  onClick,
}: ParticipationProps) => {
  return (
    <Button
      style={{ width: 140 }}
      size="sm"
      onClick={onClick}
      loading={isLoading}
      leftSection={<IconHandStop size={18} />}
      data-testid="participate"
      // disabled={!actions.participationEnabled}
    >
      {title}
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
