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
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from 'react-router'
import type { Route } from './+types/root'
import './app.css'
import type { User } from '@downtown65/schema'
import { useDisclosure } from '@mantine/hooks'
import type { PropsWithChildren } from 'react'
import { AppTheme } from '~/app-theme'
import {
  LoggedInNavigation,
  LoggedOutNavigation,
  Navbar,
} from './components/navigation'
import { AuthContext } from './context/context'

export const loader = async ({ context }: Route.LoaderArgs) => {
  const authContext = context.get(AuthContext)

  if (authContext) {
    return {
      user: authContext.user,
    }
  }
  return {
    user: null,
  }
}

export const meta: Route.MetaFunction = () => {
  return [
    { title: 'Downtown65 Events' },
    {
      content: 'Events calendar for Downtown 65 Endurance ry',
      name: 'description',
    },
    { content: '#da532c', name: 'msapplication-TileColor' },
    { content: '#ffffff', name: 'theme-color' },
  ]
}

export const links: Route.LinksFunction = () => {
  return [
    {
      href: '/apple-touch-icon.png',
      rel: 'apple-touch-icon',
      sizes: '180x180',
    },
    {
      href: '/favicon-32x32.png',
      rel: 'icon',
      sizes: '32x32',
      type: 'image/png',
    },
    {
      href: '/favicon-16x16.png',
      rel: 'icon',
      sizes: '16x16',
      type: 'image/png',
    },
    {
      href: '/site.webmanifest',
      rel: 'manifest',
    },
    {
      color: '#5bbad5',
      href: '/safari-pinned-tab.svg',
      rel: 'mask-icon',
    },
  ]
}

export function Layout({ children }: PropsWithChildren<Route.ComponentProps>) {
  const data = useRouteLoaderData('root')
  const user = (data?.user as User) ?? null

  const [navigationOpened, { toggle, close }] = useDisclosure()

  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <meta charSet="utf-8" />
        <meta
          content="width=device-width, initial-scale=1, maximum-scale=1"
          name="viewport"
        />
        <ColorSchemeScript />
        <Meta />
        <Links />
      </head>
      <body>
        <AppTheme>
          <AppShell
            header={{ height: { base: 60, lg: 80, md: 70 } }}
            navbar={{
              breakpoint: 'sm',
              collapsed: { desktop: true, mobile: !navigationOpened },
              width: 300,
            }}
            padding="xs"
          >
            <AppShell.Header>
              {user && (
                <LoggedInNavigation
                  close={close}
                  navigationOpened={navigationOpened}
                  toggle={toggle}
                  user={user}
                />
              )}
              {!user && <LoggedOutNavigation />}
            </AppShell.Header>
            <AppShell.Navbar p="sm" py="md">
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
    <Container component="main" mx="auto" p="md" pt="xl">
      <Title>{message}</Title>
      <Text>{details}</Text>
      {stack && (
        <Box component="pre" p="md" style={{ overflowX: 'auto' }} w="100%">
          <Code>{stack}</Code>
        </Box>
      )}
    </Container>
  )
}
