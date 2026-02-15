import {
  Anchor,
  Breadcrumbs,
  Container,
  Pagination,
  Table,
  Text,
  Title,
} from '@mantine/core'
import { Link, redirect, useNavigate } from 'react-router'
import { getApiClient } from '~/api/api-client'
import { AuthContext } from '~/context/context'
import { authMiddleware } from '~/middleware/auth-middleware'
import type { Route } from './+types/route'

export const middleware = [authMiddleware()]

const toPage = (page: string | undefined | null) => {
  if (!page) {
    return '1'
  }
  const parsed = parseInt(page, 10)
  if (Number.isNaN(parsed) || parsed < 1) {
    return '1'
  }
  return parsed.toString()
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const logger = context.logger.child()
  logger.withContext({ route: 'members index' })

  const authContext = context.get(AuthContext)
  if (!authContext) {
    return redirect('/login')
  }

  const url = new URL(request.url)
  const page = toPage(url.searchParams.get('page'))

  const { user, accessToken } = authContext
  const apiClient = getApiClient(context.cloudflare.env.API_HOST)
  const { data, error } = await apiClient.GET('/users', {
    headers: {
      authorization: `Bearer ${accessToken}`,
      'x-api-key': context.cloudflare.env.API_KEY,
    },
    params: {
      query: {
        limit: '30',
        page,
      },
    },
  })

  if (error) {
    logger.withError(error).error('Failed to load users list')
    return {
      currentPage: 0,
      numPages: 0,
      perPage: 0,
      start: 0,
      user,
      userCount: 0,
      users: [],
      usersOnPage: 0,
    }
  }

  const { users, total, length, limit, start } = data

  const extra = total % limit === 0 ? 0 : 1
  const numberPages = Math.floor(total / limit) + extra
  const currentPage = Math.floor(start / limit) + 1

  logger
    .withMetadata({ data: { ...data, users: undefined } })
    .debug('Loaded users list')
  return {
    currentPage,
    numPages: numberPages,
    perPage: limit,
    start,
    user,
    userCount: total,
    users,
    usersOnPage: length,
  }
}

export default function Users({ loaderData }: Route.ComponentProps) {
  const {
    users,
    start,
    usersOnPage,
    userCount,
    numPages,
    currentPage,
    perPage,
  } = loaderData

  const navigate = useNavigate()
  const hasPagination = userCount > perPage

  const rows = users.map((u, index) => (
    <Table.Tr key={u.sub}>
      <Table.Td>
        <Anchor
          component={Link}
          data-testid={`member-nick-${index}`}
          to={`/members/${u.nickname}`}
        >
          {u.nickname}
        </Anchor>
      </Table.Td>
      <Table.Td data-testid={`member-name-${index}`}>{u.name}</Table.Td>
    </Table.Tr>
  ))

  return (
    <>
      <Container fluid mt="xs">
        <Breadcrumbs mb="xs">
          <Text data-testid="breadcrumbs-current">Jäsenet</Text>
        </Breadcrumbs>
      </Container>
      <Container>
        <Title>Jäsenet</Title>
        <Text c="dimmed" fw={500} mb="xs">
          Jäseniä yhteensä: {userCount}
        </Text>
        {hasPagination && (
          <Pagination
            my="md"
            onChange={(page) => {
              navigate(`?page=${page}`)
            }}
            total={numPages}
            value={currentPage}
            withControls={false}
          />
        )}
        <Table
          highlightOnHover
          horizontalSpacing="sm"
          striped
          verticalSpacing="sm"
          withColumnBorders
          withRowBorders
          withTableBorder
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Nick</Table.Th>
              <Table.Th>Nimi</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
        {hasPagination && (
          <Pagination
            my="md"
            onChange={(page) => {
              navigate(`?page=${page}`)
            }}
            total={numPages}
            value={currentPage}
            withControls={false}
          />
        )}
        <Text c="dimmed" fw={500} my="sm">
          Tulokset: {start + 1} - {start + usersOnPage} ({userCount})
        </Text>
      </Container>
    </>
  )
}
