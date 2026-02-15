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
  subscriptions: z.object({
    eventCreationEmail: z.boolean(),
    weeklyEmail: z.boolean(),
  }),
})
