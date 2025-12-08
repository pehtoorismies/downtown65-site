import { z } from 'zod'

export const Auth0UserSchema = z
  .object({
    name: z.string(),
    nickname: z.string(),
    email: z.string(),
    picture: z.string(),
    user_id: z.string(),
    created_at: z.iso.datetime(),
    app_metadata: z.object({
      role: z.string(),
    }),
    user_metadata: z.object({
      subscribeWeeklyEmail: z.boolean(),
      subscribeEventCreationEmail: z.boolean(),
    }),
  })
  .transform((user) => ({
    ...user,
    id: user.user_id,
    createdAt: user.created_at,
    roles: [user.app_metadata.role],
    preferences: {
      subscribeWeeklyEmail: user.user_metadata.subscribeWeeklyEmail,
      subscribeEventCreationEmail: user.user_metadata.subscribeEventCreationEmail,
    },
  }))

export const Auth0UserListResponseSchema = z.object({
  users: z.array(Auth0UserSchema),
  total: z.number(),
  start: z.number(),
  limit: z.number(),
  length: z.number(),
})
