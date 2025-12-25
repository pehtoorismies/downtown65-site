import { Card } from '@mantine/core'
import type { PropsWithChildren } from 'react'
import { VoucherHeader } from './VoucherHeader'

export const Voucher = ({ children }: PropsWithChildren) => {
  return (
    <Card withBorder radius="md" shadow="xs">
      {children}
    </Card>
  )
}

Voucher.displayName = 'VoucherComponent'

Voucher.Header = VoucherHeader

const Content = ({ children }: PropsWithChildren) => {
  return <>{children}</>
}

Content.displayName = 'VoucherContent'

Voucher.Content = Content
