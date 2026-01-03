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
import { apiClient } from '~/api/api-client'
import { AuthContext } from '~/context/context'
import { createLogger } from '~/logger/logger.server'
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
  const logger = createLogger({ appContext: 'Frontend: Members Index' })
  const authContext = context.get(AuthContext)
  if (!authContext) {
    return redirect('/login')
  }

  const url = new URL(request.url)
  const page = toPage(url.searchParams.get('page'))

  const { user, accessToken } = authContext
  const { data, error } = await apiClient.GET('/users', {
    params: {
      query: {
        page,
        limit: '30',
      },
    },
    headers: {
      'x-api-key': context.cloudflare.env.API_KEY,
      authorization: `Bearer ${accessToken}`,
    },
  })

  if (error) {
    logger.withError(error).error('Failed to load users list')
    return {
      user,
      users: [],
      userCount: 0,
      numPages: 0,
      currentPage: 0,
      perPage: 0,
      usersOnPage: 0,
      start: 0,
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
    user,
    users,
    userCount: total,
    numPages: numberPages,
    currentPage,
    perPage: limit,
    usersOnPage: length,
    start,
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
    <Table.Tr key={u.auth0Sub}>
      <Table.Td>
        <Anchor
          component={Link}
          to={`/members/${u.nickname}`}
          data-testid={`member-nick-${index}`}
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
            withControls={false}
            total={numPages}
            value={currentPage}
            my="md"
            onChange={(page) => {
              navigate(`?page=${page}`)
            }}
          />
        )}
        <Table
          striped
          withRowBorders
          highlightOnHover
          withTableBorder
          withColumnBorders
          horizontalSpacing="sm"
          verticalSpacing="sm"
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
            withControls={false}
            total={numPages}
            value={currentPage}
            my="md"
            onChange={(page) => {
              navigate(`?page=${page}`)
            }}
          />
        )}
        <Text c="dimmed" fw={500} my="sm">
          Tulokset: {start + 1} - {start + usersOnPage} ({userCount})
        </Text>
      </Container>
    </>
  )
}
