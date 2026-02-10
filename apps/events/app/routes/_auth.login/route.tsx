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
import { Form, Link, redirect } from 'react-router'
import z from 'zod'
import { getApiClient } from '~/api/api-client'
import { redirectAuthenticatedMiddleware } from '~/middleware/redirect-authenticated'
import { createSessionManager } from '~/session/session-manager.server'
import type { Route } from './+types/route'

export const middleware = [redirectAuthenticatedMiddleware]

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData()
  const email = formData.get('email')
  const password = formData.get('password')
  const rememberMe = formData.get('remember')

  const result = LoginSchema.safeParse({ email, password, rememberMe })
  if (!result.success) {
    const errorTree = z.treeifyError(result.error)

    return {
      emailError: errorTree.properties?.email?.errors[0],
      errorPassword: errorTree.properties?.password?.errors[0],
    }
  }

  context.logger
    .withContext({ apiHost: context.cloudflare.env.API_HOST })
    .info('Calling apiClient for login')

  const apiClient = getApiClient(context.cloudflare.env.API_HOST)
  const { data, error } = await apiClient.POST('/auth/login', {
    body: {
      email: result.data.email,
      password: result.data.password,
    },
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': context.cloudflare.env.API_KEY,
    },
  })

  if (error) {
    context.logger.withError(error).error('Server error during login')
    return { code: 500, errorGeneral: error.message }
  }

  if (data) {
    const _secrets = {
      API_KEY: context.cloudflare.env.API_KEY,
      COOKIE_SESSION_SECRET: context.cloudflare.env.COOKIE_SESSION_SECRET,
    }

    const { createUserSession, commitSession } = createSessionManager(
      context.cloudflare.env,
    )
    const userSession = await createUserSession({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      rememberMe: result.data.rememberMe != null,
      request,
      user: data.user,
    })

    const headers = new Headers()
    headers.append('Set-Cookie', await commitSession(userSession))
    return redirect('/events', {
      headers,
    })
  }

  context.logger.fatal(
    'Both error and data are undefined in login action response',
  )
  return { code: 500, errorGeneral: 'Unknown error' }
}

export default function Login({ actionData }: Route.ComponentProps) {
  return (
    <>
      <Title fw={900} ta="center">
        Kirjaudu
      </Title>
      <Text c="dimmed" mt={5} size="sm" ta="center">
        Rekisteröitymiseen tarvitset seuran jäsenyyden ja
        liittymistunnuksen.&nbsp;
        <Anchor component={Link} data-testid="to-signup" to="/signup">
          Rekisteröidy tästä.
        </Anchor>
      </Text>

      <Paper mt={30} p={30} radius="md" shadow="md" withBorder>
        {actionData?.errorGeneral && (
          <Alert
            color="red"
            icon={<IconAlertCircle size={16} />}
            mb="sm"
            title="Virhe kirjautumisessa"
          >
            {actionData?.errorGeneral}
          </Alert>
        )}
        <Form method="post">
          <TextInput
            autoComplete="email"
            error={actionData?.emailError}
            id="email"
            label="Sähköposti"
            name="email"
            placeholder="me@downtown65.com"
            required
            type="email"
          />
          <PasswordInput
            error={actionData?.errorPassword}
            id="password"
            label="Salasana"
            mt="md"
            name="password"
            placeholder="Salasanasi"
            required
          />
          <Checkbox
            label="Muista minut tällä laitteella. Kirjautuminen voimassa 365 päivää."
            mt="md"
            name="remember"
            value="remember"
          />

          <Group justify="flex-end" mt="md">
            <Anchor
              component={Link}
              data-testid="to-forgot-password"
              size="sm"
              to="/forgot-password"
            >
              Unohditko salasanan?
            </Anchor>
          </Group>
          <Button data-testid="submit-login" fullWidth mt="xl" type="submit">
            Kirjaudu
          </Button>
        </Form>
      </Paper>
    </>
  )
}
