import z from 'zod'
import { DetailedAuth0UserSchema } from '../store/schema'

export const UserResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  nickname: z.string(),
  email: z.string(),
  picture: z.string(),
  createdAt: z.iso.datetime(),
})

export const DetailedUserResponseSchema = UserResponseSchema.extend({
  roles: z.array(z.string()),
  preferences: z.object({
    subscribeWeeklyEmail: z.boolean(),
    subscribeEventCreationEmail: z.boolean(),
  }),
})

export type DetailedUserResponse = z.infer<typeof DetailedUserResponseSchema>

export const RESTDetailedUserSchema = DetailedAuth0UserSchema.transform((user) => ({
  ...user,
  id: user.user_id,
  createdAt: user.created_at,
  preferences: {
    subscribeWeeklyEmail: user.user_metadata.subscribeWeeklyEmail,
    subscribeEventCreationEmail: user.user_metadata.subscribeEventCreationEmail,
  },
  roles: [user.app_metadata.role],
}))
