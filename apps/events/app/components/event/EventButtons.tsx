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
      data-testid="leave"
      gradient={Gradient.dtPink}
      leftSection={<IconHandOff size={18} />}
      loading={isLoading}
      onClick={onClick}
      size="sm"
      style={{ width: 140 }}
      variant="gradient"
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
      data-testid="participate"
      leftSection={<IconHandStop size={18} />}
      loading={isLoading}
      onClick={onClick}
      size="sm"
      style={{ width: 140 }}
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
      data-testid="event-goto-login"
      leftSection={<IconLogin size={18} />}
      size="sm"
      to="/login"
    >
      Kirjaudu
    </Button>
  )
}
