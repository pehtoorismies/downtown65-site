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
    : { from: 'indigo', to: 'blue', deg: 45 }

  return (
    <Badge
      data-testid="event-participant"
      m={2}
      radius="md"
      styles={{ label: { textTransform: 'none' } }}
      variant="gradient"
      style={{ paddingLeft: 0 }}
      gradient={gradient}
      leftSection={
        <Avatar
          alt={`${participant.nickname}'s avatar`}
          size={24}
          mr={5}
          src={participant.picture}
        />
      }
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
          key={participant.id}
          participant={participant}
          isCurrentUser={me?.id === participant.id}
        />
      ))}
    </Group>
  )
}
