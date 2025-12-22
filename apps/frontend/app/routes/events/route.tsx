import { Container } from '@mantine/core'
import { Outlet } from 'react-router'

export default function EventBase() {
  return (
    <Container p={{ base: 1, sm: 'xs' }}>
      <Outlet />
    </Container>
  )
}
