import { Container, Text, Title } from '@mantine/core'
import { Outlet } from 'react-router'
import type { Route } from './+types/route'

export default function EventsList({ loaderData }: Route.ComponentProps) {
  return (
    <Container>
      <Title>Events parent</Title>
      <Outlet />
    </Container>
  )
}
