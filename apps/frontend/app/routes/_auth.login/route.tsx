import { LoginSchema } from '@downtown65/schema'
import {
  Alert,
  Anchor,
  Button,
  Checkbox,
  Group,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { Form, Link, useActionData, useNavigation } from 'react-router'
import { apiClient } from '~/api/api-client'
import { createSessionManager } from '~/session/session-manager.server'
import type { Route } from './+types/route'

export async function action({ request, context }: Route.ActionArgs) {
  const { createUserSession } = createSessionManager(request, context)

  const formData = await request.formData()
  const email = formData.get('email')
  const password = formData.get('password')

  const result = LoginSchema.safeParse({ email, password })
  if (!result.success) {
    return {
      errorGeneral: 'Invalid form data',
    }
  }

  const { data, error, response } = await apiClient.POST('/auth/login', {
    body: {
      email: result.data.email,
      password: result.data.password,
    },
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'dev-api-key-change-in-production',
    },
  })

  if (data) {
    return createUserSession({
      tokens: data,
      redirectTo: '/events',
      rememberMe: false,
    })
  }

  if (error) {
    // error type is union of all error response schemas
    return { errorGeneral: error.message }
  }
  return { errorGeneral: 'Unknown error' }
}

export default function Login({ actionData, loaderData }: Route.ComponentProps) {
  const navigation = useNavigation()

  return (
    <>
      <Title ta="center" fw={900}>
        Kirjaudu
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Rekisteröitymiseen tarvitset seuran jäsenyyden ja liittymistunnuksen.&nbsp;
        <Anchor component={Link} to="/signup" data-testid="to-signup">
          Rekisteröidy tästä.
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        {actionData?.errorGeneral && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Virhe kirjautumisessa"
            color="red"
            mb="sm"
          >
            {actionData?.errorGeneral}
          </Alert>
        )}
        <Form method="post">
          <TextInput
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            label="Sähköposti"
            placeholder="me@downtown65.com"
            required
          />
          <PasswordInput
            id="password"
            name="password"
            label="Salasana"
            placeholder="Salasanasi"
            required
            mt="md"
          />
          <Checkbox
            name="remember"
            value="remember"
            mt="md"
            label="Muista minut tällä laitteella. Kirjautuminen voimassa 365 päivää."
          />

          <Group justify="flex-end" mt="md">
            <Anchor
              component={Link}
              to="/forgot-password"
              size="sm"
              data-testid="to-forgot-password"
            >
              Unohditko salasanan?
            </Anchor>
          </Group>
          <Button fullWidth mt="xl" type="submit" data-testid="submit-login">
            Kirjaudu
          </Button>
        </Form>
      </Paper>
    </>
  )
}
