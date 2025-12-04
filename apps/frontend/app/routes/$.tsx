import { Button, Container, Image, SimpleGrid, Stack, Text, Title } from '@mantine/core'

import { IconArrowNarrowLeft } from '@tabler/icons-react'
import { Link } from 'react-router'

const NotFound = () => {
  return (
    <Container p="md">
      <SimpleGrid spacing={30} cols={{ base: 1, sm: 2 }}>
        <Stack align="center" gap="xs" hiddenFrom="sm">
          <Image
            src="/404.jpg"
            style={{
              maxWidth: 300,
              margin: 'auto',
            }}
          />
          <Text c="gray.7" size="sm" component="figcaption">
            Your support contact
          </Text>
        </Stack>

        <div>
          <Title fw={900}>PUMMI</Title>
          <Text c="dimmed" size="lg">
            Sivua ei löytynyt. Tarkista oletko kirjoittanut osoitteen oikein. Sivu voi myös olla
            siirretty. Tai sitten joku muu on vialla. Contact support (kuvassa)!
          </Text>
          <Button
            component={Link}
            to="/"
            variant="outline"
            size="md"
            mt="xl"
            leftSection={<IconArrowNarrowLeft size={18} />}
            data-testid="navigate-home"
          >
            Etusivulle
          </Button>
        </div>
        <Stack align="center" gap="xs" visibleFrom="sm">
          <Image src="/404.jpg" />
          <Text c="gray.7" size="sm" component="figcaption">
            Your support contact
          </Text>
        </Stack>
      </SimpleGrid>
    </Container>
  )
}

export default NotFound
