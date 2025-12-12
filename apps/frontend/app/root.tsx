import {
  AppShell,
  Box,
  Code,
  ColorSchemeScript,
  Container,
  mantineHtmlProps,
  Text,
  Title,
} from '@mantine/core'
import type React from 'react'
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router'
import type { Route } from './+types/root'
import './app.css'
import { useDisclosure } from '@mantine/hooks'
import { AppTheme } from '~/app-theme'
import {
  LoggedInNavigation,
  LoggedOutNavigation,
  Navbar,
} from './components/navigation'
import type { User } from './domain/user'

export function Layout({ children }: { children: React.ReactNode }) {
  const [navigationOpened, { toggle, close }] = useDisclosure()

  const user: User = {
    id: 'user-1',
    nickname: 'Testaaja Testinen',
    picture: 'https://example.com/avatar.jpg',
  }

  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <ColorSchemeScript />
        <Meta />
        <Links />
      </head>
      <body>
        <AppTheme>
          <AppShell
            header={{ height: { base: 60, md: 70, lg: 80 } }}
            navbar={{
              width: 300,
              breakpoint: 'sm',
              collapsed: { desktop: true, mobile: !navigationOpened },
            }}
            padding="xs"
          >
            <AppShell.Header>
              {user && (
                <LoggedInNavigation
                  user={user}
                  toggle={toggle}
                  close={close}
                  navigationOpened={navigationOpened}
                />
              )}
              {!user && <LoggedOutNavigation />}
            </AppShell.Header>
            <AppShell.Navbar py="md" p="sm">
              <Navbar close={close} />
            </AppShell.Navbar>
            <AppShell.Main>{children}</AppShell.Main>
          </AppShell>
        </AppTheme>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!'
  let details = 'An unexpected error occurred.'
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error'
    details =
      error.status === 404
        ? 'The requested page could not be found.'
        : error.statusText || details
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <Container component="main" pt="xl" p="md" mx="auto">
      <Title>{message}</Title>
      <Text>{details}</Text>
      {stack && (
        <Box component="pre" w="100%" style={{ overflowX: 'auto' }} p="md">
          <Code>{stack}</Code>
        </Box>
      )}
    </Container>
  )
}
