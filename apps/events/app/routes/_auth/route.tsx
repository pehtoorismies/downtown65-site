import { Container } from '@mantine/core'
import { Outlet } from 'react-router'

export default function AuthLayout() {
  return (
    <Container py="sm" size={420}>
      <Outlet />
    </Container>
  )
}
