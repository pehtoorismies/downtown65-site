import { ISODateTimeSchema, UserSchema } from '@downtown65/schema'
import z from 'zod'

export const UserAPIResponseSchema = z.object({
  ...UserSchema.shape,
  name: z.string(),
  email: z.email(),
  createdAt: ISODateTimeSchema,
  updatedAt: ISODateTimeSchema,
})

export const SyncedUsersResponseSchema = z.array(UserAPIResponseSchema)

export const DetailedUserAPIResponseSchema = UserAPIResponseSchema.extend({
  roles: z.array(z.string()),
  preferences: z.object({
    subscribeWeeklyEmail: z.boolean(),
    subscribeEventCreationEmail: z.boolean(),
  }),
})
