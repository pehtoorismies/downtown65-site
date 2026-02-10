import { ISODateTimeSchema, UserSchema } from '@downtown65/schema'
import z from 'zod'

export const UserAPIResponseSchema = z.object({
  ...UserSchema.shape,
  createdAt: ISODateTimeSchema,
  email: z.email(),
  name: z.string(),
  updatedAt: ISODateTimeSchema,
})

export const DetailedUserAPIResponseSchema = UserAPIResponseSchema.extend({
  preferences: z.object({
    subscribeEventCreationEmail: z.boolean(),
    subscribeWeeklyEmail: z.boolean(),
  }),
  roles: z.array(z.string()),
})
