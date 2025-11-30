import {
  Anchor,
  Breadcrumbs,
  Button,
  Center,
  Container,
  Divider,
  Image,
  Text,
  Title,
} from '@mantine/core'

import { IconArrowNarrowLeft } from '@tabler/icons-react'
import { Link, isRouteErrorResponse, useLoaderData, useRouteError } from 'react-router'

import { ProfileBox } from '../../components/ProfileBox'
import type { Route } from './+types/route'
import notFoundProfileImage from './not-found.jpg'

export function loader({ context, request, params }: Route.LoaderArgs) {
  return {
    picture: 'https://example.com/avatar.jpg',
    name: 'Nimi Sukunimi',
    nickname: params.nickname,
    email: 'response.user.email',
  }
}

export default function MemberPage() {
  const { picture, name, email, nickname } = useLoaderData()
  const createdAt = 'käyttäjä luotu: 01.01.2020'
  return (
    <>
      <Container fluid mt={75}>
        <Breadcrumbs mb="xs">
          <Anchor component={Link} to="/members" data-testid="breadcrumbs-parent">
            Jäsenet
          </Anchor>
          <Text data-testid="breadcrumbs-current">{nickname}</Text>
        </Breadcrumbs>
      </Container>
      <Container size="xs">
        <Title ta="center" order={1} mt="sm">
          Jäsenprofiili
        </Title>
        <ProfileBox picture={picture} name={name} nickname={nickname} email={email} />
        <Divider my="sm" label="System stats" labelPosition="center" />
        <Text ta="center" fz="sm" fw={500} fs="italic" data-testid="member-created-at">
          {createdAt}
        </Text>

        <Center mt="xl">
          <Anchor component={Link} to="/members" data-testid="to-members-link">
            Jäsenet-sivulle &#187;
          </Anchor>
        </Center>
      </Container>
    </>
  )
}

export const ErrorBoundary = () => {
  const error = useRouteError()

  if (!isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>Uh oh ...</h1>
        <p>Something went wrong.</p>
      </div>
    )
  }

  return (
    <Container py="lg">
      <Title my="sm" ta="center" size={40}>
        {error.status}
      </Title>
      <Image radius="md" src={notFoundProfileImage} alt="Anonymous holding fire" />
      <Text ta="center"> {error.statusText}</Text>
      <Button
        component={Link}
        to="/members"
        variant="outline"
        size="md"
        mt="xl"
        leftSection={<IconArrowNarrowLeft size={18} />}
        data-testid="to-members-button"
      >
        Jäsensivulle
      </Button>
    </Container>
  )
}
