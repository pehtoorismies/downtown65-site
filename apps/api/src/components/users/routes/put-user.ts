import {
  APIErrorResponseSchema,
  IDSchema,
  MessageSchema,
} from '@downtown65/schema'
import { createRoute, z } from '@hono/zod-openapi'
import type { AppAPI } from '~/app-api'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'
import { updateUser } from '../db/update-user'
import { UserUpdateParamsSchema } from '../shared-schema'

const UpdateSchema = UserUpdateParamsSchema.transform((obj) => {
  return {
    name: obj.name,
    nickname: obj.nickname,
    picture: obj.picture,
    subscriptions: {
      eventCreationEmail: obj.subscribeEventCreationEmail,
      weeklyEmail: obj.subscribeWeeklyEmail,
    },
  }
})

const ParamsSchema = z.object({
  id: IDSchema,
})

const route = createRoute({
  description: 'Update the authenticated user information',
  method: 'put',
  middleware: [apiKeyAuth, jwtToken()],
  path: '/users/{id}',
  request: {
    body: {
      content: {
        'application/json': { schema: UserUpdateParamsSchema },
      },
      description: 'User update payload',
      required: true,
    },
    params: ParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: MessageSchema,
        },
      },
      description: 'User updated successfully',
    },
    404: {
      content: {
        'application/json': { schema: APIErrorResponseSchema },
      },
      description: 'User not found',
    },
  },
  security: [{ ApiKeyAuth: [], BearerToken: [] }],
})

export const register = (app: AppAPI) => {
  app.openapi(route, async (c) => {
    const ctx = c.get('requestContext')
    const userParams = c.req.valid('json')
    const { id } = c.req.valid('param')

    // TODO: no error hanling here / check parsing
    const parsedParams = UpdateSchema.parse(userParams)

    const sub = await updateUser(ctx, id, userParams)
    if (!sub) {
      return c.json({ code: 404, message: `User with id ${id} not found` }, 404)
    }
    // TODO: no error hanling here
    await ctx.userService.update(sub, parsedParams)

    return c.json({ message: 'User updated successfully' }, 200)
  })
}
