import { Container, Text } from '@mantine/core'
import { Outlet } from 'react-router'

export default function AuthLayout() {
  return (
    <Container size={420} py="sm">
      <Outlet />
    </Container>
  )
}
