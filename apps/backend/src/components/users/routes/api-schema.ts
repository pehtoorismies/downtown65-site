import z from 'zod'

export const UserAPIResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  nickname: z.string(),
  email: z.string(),
  picture: z.string(),
  createdAt: z.iso.datetime(),
})

export const DetailedUserAPIResponseSchema = UserAPIResponseSchema.extend({
  roles: z.array(z.string()),
  preferences: z.object({
    subscribeWeeklyEmail: z.boolean(),
    subscribeEventCreationEmail: z.boolean(),
  }),
})
