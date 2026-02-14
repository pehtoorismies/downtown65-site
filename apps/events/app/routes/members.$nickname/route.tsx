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
import {
  isRouteErrorResponse,
  Link,
  redirect,
  useLoaderData,
  useRouteError,
} from 'react-router'
import { getApiClient } from '~/api/api-client'
import { AuthContext } from '~/context/context'
import { authMiddleware } from '~/middleware/auth-middleware'
import { ProfileBox } from '../../components/ProfileBox'
import type { Route } from './+types/route'
import notFoundProfileImage from './not-found.jpg'

export const middleware = [authMiddleware()]

export async function loader({ params, context }: Route.LoaderArgs) {
  const authContext = context.get(AuthContext)
  if (!authContext) {
    return redirect('/login')
  }

  const { accessToken } = authContext
  const apiClient = getApiClient(context.cloudflare.env.API_HOST)
  const { data, error } = await apiClient.GET('/users/{nickname}', {
    headers: {
      authorization: `Bearer ${accessToken}`,
      'x-api-key': context.cloudflare.env.API_KEY,
    },
    params: {
      path: { nickname: params.nickname },
    },
  })

  if (error) {
    const status = error.code ?? 500
    const statusText =
      status === 404 ? 'User not found' : 'Failed to load user data'
    throw new Response(statusText, { status })
  }

  return {
    createdAt: data.createdAt,
    email: data.email,
    name: data.name,
    nickname: data.nickname,
    picture: data.picture,
  }
}

export default function MemberPage() {
  const { picture, name, email, nickname, createdAt } = useLoaderData()
  const date = new Date(createdAt)
  const formattedDate = Number.isNaN(date.getTime())
    ? 'N/A'
    : date.toLocaleDateString('fi-FI')
  const createdAtText = `käyttäjä luotu: ${formattedDate}`
  return (
    <>
      <Container fluid mt={75}>
        <Breadcrumbs mb="xs">
          <Anchor
            component={Link}
            data-testid="breadcrumbs-parent"
            to="/members"
          >
            Jäsenet
          </Anchor>
          <Text data-testid="breadcrumbs-current">{nickname}</Text>
        </Breadcrumbs>
      </Container>
      <Container size="xs">
        <Title mt="sm" order={1} ta="center">
          Jäsenprofiili
        </Title>
        <ProfileBox
          email={email}
          name={name}
          nickname={nickname}
          picture={picture}
        />
        <Divider label="System stats" labelPosition="center" my="sm" />
        <Text
          data-testid="member-created-at"
          fs="italic"
          fw={500}
          fz="sm"
          ta="center"
        >
          {createdAtText}
        </Text>

        <Center mt="xl">
          <Anchor component={Link} data-testid="to-members-link" to="/members">
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
      <Title my="sm" size={40} ta="center">
        {error.status}
      </Title>
      <Image
        alt="Anonymous holding fire"
        radius="md"
        src={notFoundProfileImage}
      />
      <Text ta="center"> {error.statusText}</Text>
      <Button
        component={Link}
        data-testid="to-members-button"
        leftSection={<IconArrowNarrowLeft size={18} />}
        mt="xl"
        size="md"
        to="/members"
        variant="outline"
      >
        Jäsensivulle
      </Button>
    </Container>
  )
}
