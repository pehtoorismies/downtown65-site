import { IDSchema, ISODateTimeSchema } from '@downtown65/schema'
import z from 'zod'

export const UserAPIResponseSchema = z.object({
  createdAt: ISODateTimeSchema,
  email: z.email(),
  id: IDSchema,
  name: z.string(),
  nickname: z.string().min(1).openapi({ example: 'ada' }),
  picture: z.httpUrl(),
  sub: z.string(),
  subscriptions: z.object({
    eventCreationEmail: z.boolean(),
    weeklyEmail: z.boolean(),
  }),
  updatedAt: ISODateTimeSchema,
})
