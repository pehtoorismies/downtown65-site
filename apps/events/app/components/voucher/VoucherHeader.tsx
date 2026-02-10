import {
  BackgroundImage,
  Badge,
  Box,
  Card,
  Center,
  Text,
  ThemeIcon,
} from '@mantine/core'
import { IconUsers } from '@tabler/icons-react'
import type { PropsWithChildren, ReactNode } from 'react'
import { Gradient } from '../colors'
import classes from './voucher.module.css'

export const VoucherHeader = ({
  children,
  bgImageUrl,
}: PropsWithChildren<{ bgImageUrl: string }>) => {
  return (
    <Card.Section>
      <BackgroundImage src={bgImageUrl}>
        <Box className={classes.header}>{children}</Box>
      </BackgroundImage>
    </Card.Section>
  )
}
interface TextContentProps {
  children: string
}

interface IconProps {
  icon: ReactNode
}

interface ParticipantCountProps {
  count: number
  highlighted: boolean
}

VoucherHeader.displayName = 'VoucherHeader'

const Title = ({ children }: TextContentProps) => {
  return (
    <Box className={classes.areaTitle}>
      <Text className={classes.title} data-testid="event-title">
        {children}
      </Text>
    </Box>
  )
}
Title.displayName = 'VoucherTitle'

const Type = ({ children }: TextContentProps) => {
  return (
    <Badge
      className={classes.type}
      color="violet"
      data-testid="event-type"
      radius="xs"
      styles={{ label: { textTransform: 'none' } }}
    >
      {children}
    </Badge>
  )
}
Type.displayName = 'VoucherType'

const Creator = ({ children }: TextContentProps) => {
  return (
    <Badge
      className={classes.areaCreator}
      color="dark.2"
      data-testid="event-created-by"
      radius="xs"
      styles={{ label: { textTransform: 'none' } }}
      variant="filled"
    >
      by #{children}
    </Badge>
  )
}
Creator.displayName = 'VoucherCreator'

const Icon = ({ icon }: IconProps) => {
  return (
    <ThemeIcon
      className={classes.areaCompetition}
      color="grape"
      data-testid="event-race"
      radius="xs"
      variant="filled"
    >
      {icon}
    </ThemeIcon>
  )
}
Icon.displayName = 'VoucherIcon'

const ParticipantCount = ({ count, highlighted }: ParticipantCountProps) => {
  return (
    <Badge
      className={classes.areaParticipantCount}
      data-testid="event-participant-count"
      gradient={Gradient.dtPink}
      leftSection={
        <Center>
          <IconUsers size={16} />
        </Center>
      }
      m={0}
      radius="xs"
      size="lg"
      variant={highlighted ? 'gradient' : 'filled'}
    >
      {count}
    </Badge>
  )
}
ParticipantCount.displayName = 'VoucherParticipantCount'

VoucherHeader.ParticipantCount = ParticipantCount
VoucherHeader.Title = Title
VoucherHeader.Type = Type
VoucherHeader.Creator = Creator
VoucherHeader.Icon = Icon
