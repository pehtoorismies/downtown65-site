import {
  Anchor,
  Box,
  Button,
  Center,
  Group,
  Paper,
  Text,
  TextInput,
  Title,
} from '@mantine/core'

import { IconArrowLeft } from '@tabler/icons-react'
import { Form, Link } from 'react-router'
import { redirectAuthenticatedMiddleware } from '~/middleware/redirect-authenticated'

export const middleware = [redirectAuthenticatedMiddleware]

export default function ForgotPassword() {
  return (
    <>
      <Title ta="center" fw={900}>
        Salasana unohtunut?
      </Title>
      <Text c="dimmed" size="sm" ta="center">
        Syötä sähköpostiosoitteesi saadaksesi sähköpostiisi ohjeet salasanan
        resetoimiseksi.
      </Text>

      <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
        <Form method="post">
          <TextInput
            name="email"
            type="email"
            label="Sähköpostiosoitteesi"
            placeholder="me@downtown65.com"
            required
          />
          <Group justify="space-between" mt="lg">
            <Anchor
              component={Link}
              to="/login"
              size="sm"
              data-testid="to-login"
            >
              <Center inline>
                <IconArrowLeft size={12} stroke={1.5} />
                <Box ml={5}>Kirjautumiseen</Box>
              </Center>
            </Anchor>

            <Button type="submit">Lähetä ohjeet</Button>
          </Group>
        </Form>
      </Paper>
    </>
  )
}
