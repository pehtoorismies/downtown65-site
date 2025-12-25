import { createLogger } from '@downtown65/logger'
import { PaginationQuerySchema } from '@downtown65/schema'
import { createRoute } from '@hono/zod-openapi'
import z from 'zod'
import type { AppAPI } from '~/app-api'
import { getConfig } from '~/common/config/config'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'
import { listUsers } from '../db/list-users'
import { UserAPIResponseSchema } from './api-schema'

const route = createRoute({
  method: 'get',
  path: '/users',
  description: 'Get all users',
  security: [{ ApiKeyAuth: [], BearerToken: [] }],
  middleware: [apiKeyAuth, jwtToken()],
  request: {
    query: PaginationQuerySchema,
  },
  responses: {
    200: {
      description: 'List of all users',
      content: {
        'application/json': {
          schema: z.object({
            users: z.array(UserAPIResponseSchema.omit({ id: true })),
            total: z.number(),
            start: z.number(),
            limit: z.number(),
            length: z.number(),
          }),
        },
      },
    },
    // 401: {
    //   $ref: '#/components/responses/UnauthorizedError',
    // },
  },
})

const toValidPage = (page: string | undefined | null) => {
  if (!page) return 1
  const parsed = parseInt(page, 10)
  if (Number.isNaN(parsed) || parsed < 1) return 1
  return parsed
}

const toValidLimit = (limit: string | undefined | null) => {
  if (!limit) return 10
  const parsed = parseInt(limit, 10)
  if (Number.isNaN(parsed) || parsed < 1) return 10
  return parsed
}

export const register = (app: AppAPI) => {
  app.openapi(route, async (c) => {
    const logger = createLogger({ appContext: 'Route: Get Users' })

    const { page, limit } = c.req.valid('query')

    logger
      .withMetadata({ data: { page, limit } })
      .debug('Handling request to get users')

    const paginatedUsers = await listUsers(getConfig(c.env), {
      page: toValidPage(page),
      limit: toValidLimit(limit),
    })

    return c.json(paginatedUsers, 200)
  })
}
