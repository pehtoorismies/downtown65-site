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
      styles={{ label: { textTransform: 'none' } }}
      radius="xs"
      color="violet"
      data-testid="event-type"
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
      styles={{ label: { textTransform: 'none' } }}
      radius="xs"
      color="dark.2"
      variant="filled"
      data-testid="event-created-by"
    >
      by #{children}
    </Badge>
  )
}
Creator.displayName = 'VoucherCreator'

const Icon = ({ icon }: IconProps) => {
  return (
    <ThemeIcon
      data-testid="event-race"
      className={classes.areaCompetition}
      radius="xs"
      variant="filled"
      color="grape"
    >
      {icon}
    </ThemeIcon>
  )
}
Icon.displayName = 'VoucherIcon'

const ParticipantCount = ({ count, highlighted }: ParticipantCountProps) => {
  return (
    <Badge
      data-testid="event-participant-count"
      m={0}
      size="lg"
      leftSection={
        <Center>
          <IconUsers size={16} />
        </Center>
      }
      radius="xs"
      variant={highlighted ? 'gradient' : 'filled'}
      gradient={Gradient.dtPink}
      className={classes.areaParticipantCount}
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
