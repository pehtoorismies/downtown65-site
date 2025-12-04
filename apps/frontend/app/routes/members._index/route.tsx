import { Anchor, Breadcrumbs, Container, Pagination, Table, Text, Title } from '@mantine/core'
import { Link, useNavigate } from 'react-router'
import { apiClient } from '~/api/api-client'
import { createSessionManager } from '~/session/session-manager.server'
import type { Route } from './+types/route'

const defaultTo = (defaultValue: number, value: string | null): number => {
  if (value === null || value.length === 0) {
    return defaultValue
  }
  if (Number.isNaN(value)) {
    return defaultValue
  }
  return Number(value)
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const { loaderAuthenticate } = createSessionManager(request, context)
  const { user, accessToken } = await loaderAuthenticate()

  const url = new URL(request.url)
  const page = defaultTo(1, url.searchParams.get('page'))
  const perPage = defaultTo(50, url.searchParams.get('per_page'))

  const { data, error } = await apiClient.GET('/users', {
    query: {
      page: page - 1,
      perPage,
    },
    headers: {
      'x-api-key': context.cloudflare.env.API_KEY,
      authorization: `Bearer ${accessToken}`,
    },
  })

  if (error) {
    return []
  }

  const { users, total, length, limit, start } = data

  const extra = total % limit === 0 ? 0 : 1
  const numberPages = Math.floor(total / limit) + extra
  const currentPage = Math.floor(start / limit) + 1

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
  const { users, start, usersOnPage, userCount, numPages, currentPage, perPage } = loaderData

  const navigate = useNavigate()
  const hasPagination = userCount > perPage

  const rows = users.map((u, index) => (
    <Table.Tr key={u.id}>
      <Table.Td>
        <Anchor component={Link} to={`/members/${u.nickname}`} data-testid={`member-nick-${index}`}>
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
            // TODO: fix below
            // position="left"
            my="md"
            onChange={(page) => {
              navigate(`?page=${page}&per_page=${perPage}`)
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
            // TODO: fix below
            // position="left"
            my="md"
            onChange={(page) => {
              navigate(`?page=${page}&per_page=${perPage}`)
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
