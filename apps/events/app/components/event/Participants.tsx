import type { ID, ParticipantList } from '@downtown65/schema'
import { Avatar, Badge, Group, Text, ThemeIcon } from '@mantine/core'
import { IconUserOff } from '@tabler/icons-react'
import { Gradient } from '~/components/colors'

interface Props {
  participants: ParticipantList
  me: { id: ID } | null
}

interface ParticipantBadgeProps {
  participant: ParticipantList[number]
  isCurrentUser: boolean
}

const ParticipantBadge = ({
  participant,
  isCurrentUser,
}: ParticipantBadgeProps) => {
  const gradient = isCurrentUser
    ? Gradient.dtPink
    : { deg: 45, from: 'indigo', to: 'blue' }

  return (
    <Badge
      data-testid="event-participant"
      gradient={gradient}
      leftSection={
        <Avatar
          alt={`${participant.nickname}'s avatar`}
          mr={5}
          size={24}
          src={participant.picture}
        />
      }
      m={2}
      radius="md"
      style={{ paddingLeft: 0 }}
      styles={{ label: { textTransform: 'none' } }}
      variant="gradient"
    >
      {participant.nickname}
    </Badge>
  )
}

const EmptyState = () => (
  <Group justify="center" p="md">
    <ThemeIcon color="gray.4" size="lg">
      <IconUserOff />
    </ThemeIcon>
    <Text c="dimmed">Tapahtumassa ei osallistujia</Text>
  </Group>
)

export const Participants = ({ participants, me }: Props) => {
  if (participants.length === 0) {
    return <EmptyState />
  }

  return (
    <Group align="left" gap={2}>
      {participants.map((participant) => (
        <ParticipantBadge
          isCurrentUser={me?.id === participant.id}
          key={participant.id}
          participant={participant}
        />
      ))}
    </Group>
  )
}
