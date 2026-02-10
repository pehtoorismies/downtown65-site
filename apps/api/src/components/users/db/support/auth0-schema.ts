import { Auth0SubSchema, ISODateTimeSchema } from '@downtown65/schema'
import { z } from 'zod'

export const Auth0UserSchema = z
  .object({
    app_metadata: z.object({
      role: z.string(),
    }),
    created_at: ISODateTimeSchema,
    email: z.email(),
    name: z.string(),
    nickname: z.string(),
    picture: z.httpUrl(),
    updated_at: ISODateTimeSchema,
    user_id: z.string(),
    user_metadata: z.object({
      subscribeEventCreationEmail: z.boolean(),
      subscribeWeeklyEmail: z.boolean(),
    }),
  })
  .transform((user) => ({
    ...user,
    auth0Sub: Auth0SubSchema.parse(user.user_id),
    createdAt: user.created_at,
    preferences: {
      subscribeEventCreationEmail:
        user.user_metadata.subscribeEventCreationEmail,
      subscribeWeeklyEmail: user.user_metadata.subscribeWeeklyEmail,
    },
    roles: [user.app_metadata.role],
    updatedAt: user.created_at,
  }))

export const Auth0UserListResponseSchema = z.object({
  length: z.number(),
  limit: z.number(),
  start: z.number(),
  total: z.number(),
  users: z.array(Auth0UserSchema),
})
