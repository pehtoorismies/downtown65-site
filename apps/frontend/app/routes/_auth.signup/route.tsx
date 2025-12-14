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
      <Title ta="center" fw={900}>
        Rekisteröidy
      </Title>
      <Text size="sm" ta="center" mt={5}>
        Rekiteröitymiseen tarvitset seuran jäsenyyden ja liittymistunnuksen.
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Form method="post">
          <TextInput
            name="email"
            type="email"
            autoComplete="email"
            label="Sähköposti"
            placeholder="me@downtown65.com"
            required
          />

          <PasswordInput
            name="password"
            label="Salasana"
            placeholder="Salasanasi"
            required
            mt="md"
          />
          <TextInput
            name="name"
            label="Nimi"
            placeholder="Etunimi Sukunimi"
            required
            mt="md"
          />
          <TextInput
            name="nickname"
            description="Tunnus/nickname, näkyy ilmoittautumisissa"
            label="Nickname"
            placeholder="setämies72"
            required
            mt="md"
          />
          <PasswordInput
            name="registerSecret"
            label="Rekisteröintitunnus"
            description="Saat tämän seuralta."
            placeholder="supersecret"
            required
            mt="md"
          />
          <Group justify="flex-end" mt="md">
            <Anchor
              component={Link}
              to="/login"
              size="sm"
              data-testid="to-login"
            >
              Kirjautumiseen
            </Anchor>
          </Group>
          <Button
            fullWidth
            mt="xl"
            type="submit"
            loading={navigation.state === 'submitting'}
            data-testid="submit-signup"
          >
            Rekisteröidy
          </Button>
        </Form>
      </Paper>
    </>
  )
}
