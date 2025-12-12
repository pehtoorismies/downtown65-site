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
import { authMiddleware } from '~/middleware/authMiddleware'

export const middleware = [authMiddleware()]

export const loader = async () => {
  return {
    user: {
      nickname: 'nickname',
      id: '123',
      picture: 'https://example.com/avatar.jpg',
    },
    email: 'email@example.com',
    name: 'Simon Saimaanranta',
    preferences: {
      subscribeWeeklyEmail: true,
      subscribeEventCreationEmail: true,
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
    weekly: preferences.subscribeWeeklyEmail,
    eventCreated: preferences.subscribeEventCreationEmail,
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
          picture={user.picture}
          nickname={user.nickname}
          name={name}
          email={email}
        />
        <Center mt="sm">
          <Form action="/profile/change-avatar">
            <Button
              size="compact-xs"
              variant="outline"
              type="submit"
              data-testid="change-avatar-btn"
            >
              Vaihda profiilikuva
            </Button>
          </Form>
        </Center>
      </Container>
      <Container size={BOX_SIZE}>
        <Divider my="sm" label="Sähköpostiasetukset" labelPosition="center" />
        <Group justify="center">
          <div style={{ position: 'relative' }}>
            {fetcher.state === 'submitting' && <LoadingOverlay visible />}
            <Switch
              styles={switchStyles}
              name="eventCreated"
              label="Lähetä sähköposti, kun uusi tapahtuma luodaan."
              checked={emailSettings.eventCreated}
              onChange={onChangeEventCreatedSubscription}
              onLabel="ON"
              offLabel="OFF"
              size="md"
              data-testid="preference-event-created"
            />
            <Switch
              disabled
              name="weekly"
              styles={switchStyles}
              label="Lähetä viikon tapahtumat sähköpostitse. (Ei käytössä)"
              onLabel="ON"
              offLabel="OFF"
              checked={preferences.subscribeWeeklyEmail}
              size="md"
              my="sm"
            />
          </div>
        </Group>
      </Container>
      <Container size={BOX_SIZE}>
        <Divider my="sm" label="Kirjaudu ulos" labelPosition="center" />
        <Group justify="center">
          <Form action="/logout" method="post">
            <Button
              type="submit"
              leftSection={<IconLogout size={18} />}
              data-testid="profile-logout"
            >
              Kirjaudu ulos
            </Button>
          </Form>
        </Group>
      </Container>
    </>
  )
}
