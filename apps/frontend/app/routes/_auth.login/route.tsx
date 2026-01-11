import { createLogger } from '@downtown65/logger'
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
import { apiClient } from '~/api/api-client'
import { redirectAuthenticatedMiddleware } from '~/middleware/redirect-authenticated'
import { createSessionManager } from '~/session/session-manager.server'
import type { Route } from './+types/route'

export const middleware = [redirectAuthenticatedMiddleware]

export async function action({ request, context }: Route.ActionArgs) {
  const logger = createLogger({ appContext: 'Frontend Login' })
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
    logger.withError(error).error('Server error during login')
    return { errorGeneral: error.message, code: 500 }
  }

  if (data) {
    const secrets = {
      COOKIE_SESSION_SECRET: context.cloudflare.env.COOKIE_SESSION_SECRET,
      API_KEY: context.cloudflare.env.API_KEY,
    }

    const { createUserSession, commitSession } = createSessionManager(secrets)
    const userSession = await createUserSession({
      request,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      rememberMe: result.data.rememberMe != null,
      user: data.user,
    })

    const headers = new Headers()
    headers.append('Set-Cookie', await commitSession(userSession))
    return redirect('/events', {
      headers,
    })
  }

  logger.fatal('Both error and data are undefined in login action response')
  return { errorGeneral: 'Unknown error', code: 500 }
}

export default function Login({ actionData }: Route.ComponentProps) {
  console.warn('Login actionData', actionData)
  return (
    <>
      <Title ta="center" fw={900}>
        Kirjaudu
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Rekisteröitymiseen tarvitset seuran jäsenyyden ja
        liittymistunnuksen.&nbsp;
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
            error={actionData?.emailError}
          />
          <PasswordInput
            id="password"
            name="password"
            label="Salasana"
            placeholder="Salasanasi"
            required
            mt="md"
            error={actionData?.errorPassword}
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
