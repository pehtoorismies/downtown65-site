import { APIErrorResponseSchema, MessageSchema } from '@downtown65/schema'
import { createRoute } from '@hono/zod-openapi'
import type { AppAPI } from '~/app-api'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'
import { getUserId } from '../db/get-user-id'
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

const route = createRoute({
  description: 'Update the authenticated user information',
  method: 'put',
  middleware: [apiKeyAuth, jwtToken()],
  path: '/users/me',
  request: {
    body: {
      content: {
        'application/json': { schema: UserUpdateParamsSchema },
      },
      description: 'User update payload',
      required: true,
    },
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
    500: {
      content: {
        'application/json': { schema: APIErrorResponseSchema },
      },
      description: 'Internal server error',
    },
  },
  security: [{ ApiKeyAuth: [], BearerToken: [] }],
})

export const register = (app: AppAPI) => {
  app.openapi(route, async (c) => {
    const ctx = c.get('requestContext')
    const userParams = c.req.valid('json')
    const { sub } = c.get('jwtPayload')

    // TODO: no error hanling here / check parsing
    const parsedParams = UpdateSchema.parse(userParams)

    const id = await getUserId(ctx, sub)

    if (!id) {
      return c.json(
        { code: 500, message: `User with sub ${sub} not found` },
        500,
      )
    }

    await updateUser(ctx, id, userParams)
    await ctx.userService.update(sub, parsedParams)

    return c.json({ message: 'User updated successfully' }, 200)
  })
}
