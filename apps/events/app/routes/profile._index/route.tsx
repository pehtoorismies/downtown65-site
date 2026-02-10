import {
  Breadcrumbs,
  Button,
  Center,
  Container,
  Divider,
  Group,
  LoadingOverlay,
  Switch,
  Text,
} from '@mantine/core'

import { IconLogout } from '@tabler/icons-react'
import type { ChangeEventHandler } from 'react'
import { useState } from 'react'
import { Form, useFetcher, useLoaderData } from 'react-router'
import { ProfileBox } from '~/components/ProfileBox'
import { authMiddleware } from '~/middleware/auth-middleware'

export const middleware = [authMiddleware()]

export const loader = async () => {
  return {
    email: 'email@example.com',
    name: 'Simon Saimaanranta',
    preferences: {
      subscribeEventCreationEmail: true,
      subscribeWeeklyEmail: true,
    },
    user: {
      id: '123',
      nickname: 'nickname',
      picture: 'https://example.com/avatar.jpg',
    },
  }
}

const switchStyles = {
  label: {
    paddingLeft: 0,
  },
  labelWrapper: {
    marginLeft: 10,
  },
}

interface UserPreferences {
  weekly: boolean
  eventCreated: boolean
}

const BOX_SIZE = 'xs'

export default function Profile() {
  const fetcher = useFetcher()

  const { name, user, preferences, email } = useLoaderData<typeof loader>()

  const [emailSettings, setEmailSettings] = useState<UserPreferences>({
    eventCreated: preferences.subscribeEventCreationEmail,
    weekly: preferences.subscribeWeeklyEmail,
  })

  const onChangeEventCreatedSubscription: ChangeEventHandler<
    HTMLInputElement
  > = (event) => {
    setEmailSettings({
      ...emailSettings,
      eventCreated: event.currentTarget.checked,
    })
    fetcher.submit(
      {
        eventCreated: event.currentTarget.checked ? 'on' : 'off',
        weekly: emailSettings.weekly ? 'on' : 'off',
      },
      { method: 'post' },
    )
  }

  return (
    <>
      <Container fluid mt="xs">
        <Breadcrumbs mb="xs">
          <Text data-testid="breadcrumbs-current">Oma profiili</Text>
        </Breadcrumbs>
      </Container>
      <Container size={BOX_SIZE}>
        <ProfileBox
          email={email}
          name={name}
          nickname={user.nickname}
          picture={user.picture}
        />
        <Center mt="sm">
          <Form action="/profile/change-avatar">
            <Button
              data-testid="change-avatar-btn"
              size="compact-xs"
              type="submit"
              variant="outline"
            >
              Vaihda profiilikuva
            </Button>
          </Form>
        </Center>
      </Container>
      <Container size={BOX_SIZE}>
        <Divider label="Sähköpostiasetukset" labelPosition="center" my="sm" />
        <Group justify="center">
          <div style={{ position: 'relative' }}>
            {fetcher.state === 'submitting' && <LoadingOverlay visible />}
            <Switch
              checked={emailSettings.eventCreated}
              data-testid="preference-event-created"
              label="Lähetä sähköposti, kun uusi tapahtuma luodaan."
              name="eventCreated"
              offLabel="OFF"
              onChange={onChangeEventCreatedSubscription}
              onLabel="ON"
              size="md"
              styles={switchStyles}
            />
            <Switch
              checked={preferences.subscribeWeeklyEmail}
              disabled
              label="Lähetä viikon tapahtumat sähköpostitse. (Ei käytössä)"
              my="sm"
              name="weekly"
              offLabel="OFF"
              onLabel="ON"
              size="md"
              styles={switchStyles}
            />
          </div>
        </Group>
      </Container>
      <Container size={BOX_SIZE}>
        <Divider label="Kirjaudu ulos" labelPosition="center" my="sm" />
        <Group justify="center">
          <Form action="/logout" method="post">
            <Button
              data-testid="profile-logout"
              leftSection={<IconLogout size={18} />}
              type="submit"
            >
              Kirjaudu ulos
            </Button>
          </Form>
        </Group>
      </Container>
    </>
  )
}
