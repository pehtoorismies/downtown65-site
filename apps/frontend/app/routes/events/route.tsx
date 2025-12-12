import { Container, Title } from '@mantine/core'
import { Outlet } from 'react-router'

export default function EventsList() {
  return (
    <Container>
      <Title>Events parent</Title>
      <Outlet />
    </Container>
  )
}
