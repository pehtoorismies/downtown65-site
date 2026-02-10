import { Divider, Text, Typography } from '@mantine/core'
import { EVENT_CARD_LABELS } from './EventCard.constants'

interface EventDescriptionProps {
  description: string | null
}

const sanitizeDescription = (description: string | null): string | null => {
  if (!description || description.trim().length === 0) {
    return null
  }
  return description.trim()
}

export const EventDescription = ({ description }: EventDescriptionProps) => {
  const cleanDescription = sanitizeDescription(description)

  return (
    <>
      <Divider
        label={EVENT_CARD_LABELS.additionalInfo}
        labelPosition="center"
        my="xs"
      />
      {cleanDescription ? (
        <Typography mt="sm" p={0}>
          {/* TODO: Replace dangerouslySetInnerHTML with proper rich text renderer or sanitization */}
          {/* biome-ignore lint/security/noDangerouslySetInnerHtml: Fix later */}
          <div dangerouslySetInnerHTML={{ __html: cleanDescription }} />
        </Typography>
      ) : (
        <Text c="dimmed" fw={400} p="sm" ta="center">
          {EVENT_CARD_LABELS.noDescription}
        </Text>
      )}
    </>
  )
}
