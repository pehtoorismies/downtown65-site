import {
  Anchor,
  Button,
  Group,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { Form, Link, useNavigation } from 'react-router'
import { redirectAuthenticatedMiddleware } from '~/middleware/redirect-authenticated'

export const middleware = [redirectAuthenticatedMiddleware]

export default function Signup() {
  const navigation = useNavigation()

  return (
    <>
      <Title fw={900} ta="center">
        Rekisteröidy
      </Title>
      <Text mt={5} size="sm" ta="center">
        Rekiteröitymiseen tarvitset seuran jäsenyyden ja liittymistunnuksen.
      </Text>

      <Paper mt={30} p={30} radius="md" shadow="md" withBorder>
        <Form method="post">
          <TextInput
            autoComplete="email"
            label="Sähköposti"
            name="email"
            placeholder="me@downtown65.com"
            required
            type="email"
          />

          <PasswordInput
            label="Salasana"
            mt="md"
            name="password"
            placeholder="Salasanasi"
            required
          />
          <TextInput
            label="Nimi"
            mt="md"
            name="name"
            placeholder="Etunimi Sukunimi"
            required
          />
          <TextInput
            description="Tunnus/nickname, näkyy ilmoittautumisissa"
            label="Nickname"
            mt="md"
            name="nickname"
            placeholder="setämies72"
            required
          />
          <PasswordInput
            description="Saat tämän seuralta."
            label="Rekisteröintitunnus"
            mt="md"
            name="registerSecret"
            placeholder="supersecret"
            required
          />
          <Group justify="flex-end" mt="md">
            <Anchor
              component={Link}
              data-testid="to-login"
              size="sm"
              to="/login"
            >
              Kirjautumiseen
            </Anchor>
          </Group>
          <Button
            data-testid="submit-signup"
            fullWidth
            loading={navigation.state === 'submitting'}
            mt="xl"
            type="submit"
          >
            Rekisteröidy
          </Button>
        </Form>
      </Paper>
    </>
  )
}
