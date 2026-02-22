import { createRoute } from '@hono/zod-openapi'
import z from 'zod'
import type { AppAPI } from '~/app-api'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'
import { UserAPIResponseSchema } from './user-api-response-schema'

export const PaginationQuerySchema = z.object({
  limit: z.string().optional().default('10'),
  page: z.string().optional().default('1'),
})

const route = createRoute({
  description: 'Get all users',
  method: 'get',
  middleware: [apiKeyAuth, jwtToken()],
  path: '/users',
  request: {
    query: PaginationQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            length: z.number(),
            limit: z.number(),
            start: z.number(),
            total: z.number(),
            users: z.array(
              UserAPIResponseSchema.omit({ id: true, subscriptions: true }),
            ),
          }),
        },
      },
      description: 'List of all users',
    },
  },
  security: [{ ApiKeyAuth: [], BearerToken: [] }],
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
    const ctx = c.get('requestContext')

    const { page, limit } = c.req.valid('query')

    ctx.logger
      .withMetadata({
        data: {
          limit,
          page,
          toValidPage: toValidPage(page),
          validLimit: toValidLimit(limit),
        },
      })
      .debug('Handling request to get users')

    const paginatedUsers = await ctx.userService.paginatedList(
      toValidPage(page),
      toValidLimit(limit),
    )

    return c.json(paginatedUsers, 200)
  })
}
