import type { User } from '@downtown65/schema'
import { Avatar, Burger, Button, Group, Menu, Text } from '@mantine/core'
import { IconChevronDown, IconLogout, IconUser } from '@tabler/icons-react'
import cx from 'clsx'
import { Form, Link, NavLink, useFetcher } from 'react-router'
import classes from './navigation.module.css'

const navLinks = [
  { id: 10, title: 'Tapahtumat', to: '/events' },
  // { id: 20, title: 'Haasteet', to: '/challenges' },
  {
    id: 30,
    // to: '/create',
    testId: 'nav-create-new-event',
    title: 'Luo uusi',
    to: '/events/new',
  },
  { id: 40, title: 'Jäsenet', to: '/members' },
]

interface LoggedInProps {
  user: User
  toggle: () => void
  close: () => void
  navigationOpened: boolean
}

export const LoggedInNavigation = ({
  user,
  toggle,
  close,
  navigationOpened,
}: LoggedInProps) => {
  const fetcher = useFetcher()

  return (
    <Group h="100%" px="md" wrap="nowrap">
      <Burger
        hiddenFrom="sm"
        onClick={toggle}
        opened={navigationOpened}
        size="sm"
      />
      <Group gap={0} justify="space-between" style={{ flex: 1 }} wrap="nowrap">
        <Group style={{ width: 130 }}>
          <Text
            style={{
              userSelect: 'none',
            }}
          >
            Dt65 Events
          </Text>
        </Group>
        <Group
          gap={5}
          justify="center"
          style={{
            flex: 1,
          }}
          visibleFrom="sm"
        >
          {navLinks.map(({ id, to, title, testId }) => (
            <NavLink
              className={({ isActive }) => {
                return cx(
                  classes.control,
                  classes.controlDesktop,
                  isActive && classes.active,
                )
              }}
              data-testid={testId}
              end
              key={id}
              to={to}
            >
              {title}
            </NavLink>
          ))}
        </Group>
        <Menu
          position="bottom-end"
          shadow="md"
          transitionProps={{ transition: 'pop-top-right' }}
          width={160}
        >
          <Menu.Target>
            <Button
              leftSection={
                <Avatar
                  alt={user.nickname}
                  radius="xl"
                  size={20}
                  src={user.picture}
                />
              }
              rightSection={<IconChevronDown size={12} stroke={1.5} />}
              variant="subtle"
            >
              {user.nickname}
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              component={Link}
              leftSection={<IconUser size={14} stroke={1.5} />}
              onClick={close}
              to="/profile"
            >
              Profiili
            </Menu.Item>
            <Menu.Item
              leftSection={<IconLogout size={14} stroke={1.5} />}
              onClick={() => {
                close()
                fetcher.submit({}, { action: '/logout', method: 'post' })
              }}
            >
              Logout
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Group>
  )
}

export const LoggedOutNavigation = () => {
  return (
    <Group h="100%" px="md">
      <Group justify="space-between" style={{ flex: 1 }}>
        <Text style={{ userSelect: 'none' }}>Dt65 Events</Text>
        <Group gap={10} ml="xl" visibleFrom="sm">
          <Button
            component={Link}
            data-testid="button-to-login"
            to="/login"
            variant="default"
          >
            Kirjaudu
          </Button>
          <Button component={Link} data-testid="button-to-signup" to="/signup">
            Rekisteröidy
          </Button>
        </Group>
      </Group>
    </Group>
  )
}

interface NavbarProps {
  close: () => void
}

export const Navbar = ({ close }: NavbarProps) => {
  return (
    <>
      {navLinks.map(({ id, to, title, testId }) => {
        return (
          <NavLink
            className={({ isActive }) => {
              return cx(
                classes.control,
                classes.controlMobile,
                isActive && classes.active,
              )
            }}
            data-testid={testId}
            end
            key={id}
            onClick={close}
            to={to}
          >
            {title}
          </NavLink>
        )
      })}
      <Group grow justify="center" pb="xl" px="md">
        <Form action="/logout" method="post">
          <Button
            fullWidth
            leftSection={<IconLogout size={18} />}
            my="md"
            onClick={close}
            type="submit"
          >
            Kirjaudu ulos
          </Button>
        </Form>
      </Group>
    </>
  )
}
