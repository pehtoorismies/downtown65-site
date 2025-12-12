import z from 'zod'
import { Auth0SubSchema, IDSchema } from '~/common/schema'

export const UserAPIResponseSchema = z.object({
  id: IDSchema,
  auth0Sub: Auth0SubSchema,
  name: z.string(),
  nickname: z.string(),
  email: z.email(),
  picture: z.url(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export const SyncedUsersResponseSchema = z.array(UserAPIResponseSchema)

export const DetailedUserAPIResponseSchema = UserAPIResponseSchema.extend({
  roles: z.array(z.string()),
  preferences: z.object({
    subscribeWeeklyEmail: z.boolean(),
    subscribeEventCreationEmail: z.boolean(),
  }),
})
