import { Container } from '@mantine/core'
import { Outlet } from 'react-router'

export default function EventsList() {
  return (
    <Container>
      <Outlet />
    </Container>
  )
}
