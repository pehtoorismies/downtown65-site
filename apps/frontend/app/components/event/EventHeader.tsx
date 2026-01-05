import { IconMedal } from '@tabler/icons-react'
import { Voucher } from '../voucher/Voucher'

interface EventHeaderProps {
  title: string
  eventText: string
  imageUrl: string
  creatorNickname: string
  count: number
  meAttending: boolean
  race: boolean
}

export const EventHeader = ({
  title,
  eventText,
  imageUrl,
  creatorNickname,
  count,
  meAttending,
  race,
}: EventHeaderProps) => (
  <Voucher.Header bgImageUrl={imageUrl}>
    <Voucher.Header.Title>{title}</Voucher.Header.Title>
    <Voucher.Header.ParticipantCount count={count} highlighted={meAttending} />
    <Voucher.Header.Type>{eventText}</Voucher.Header.Type>
    <Voucher.Header.Creator>{creatorNickname}</Voucher.Header.Creator>
    {race && <Voucher.Header.Icon icon={<IconMedal color="white" />} />}
  </Voucher.Header>
)
