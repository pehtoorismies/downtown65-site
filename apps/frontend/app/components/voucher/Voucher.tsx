import { Card } from '@mantine/core'
import type { PropsWithChildren } from 'react'
import { VoucherHeader } from './VoucherHeader'

interface VoucherProps extends PropsWithChildren {}

const VoucherRoot = ({ children }: VoucherProps) => {
  return (
    <Card withBorder radius="md" shadow="xs">
      {children}
    </Card>
  )
}

const Content = ({ children }: PropsWithChildren) => {
  return <>{children}</>
}

Content.displayName = 'VoucherContent'

// Type-safe compound component
type VoucherComponent = typeof VoucherRoot & {
  Header: typeof VoucherHeader
  Content: typeof Content
  displayName?: string
}

export const Voucher = VoucherRoot as VoucherComponent
Voucher.Header = VoucherHeader
Voucher.Content = Content
Voucher.displayName = 'Voucher'
