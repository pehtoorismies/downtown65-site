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
      <Title fw={900} ta="center">
        Salasana unohtunut?
      </Title>
      <Text c="dimmed" size="sm" ta="center">
        Syötä sähköpostiosoitteesi saadaksesi sähköpostiisi ohjeet salasanan
        resetoimiseksi.
      </Text>

      <Paper mt="xl" p={30} radius="md" shadow="md" withBorder>
        <Form method="post">
          <TextInput
            label="Sähköpostiosoitteesi"
            name="email"
            placeholder="me@downtown65.com"
            required
            type="email"
          />
          <Group justify="space-between" mt="lg">
            <Anchor
              component={Link}
              data-testid="to-login"
              size="sm"
              to="/login"
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
