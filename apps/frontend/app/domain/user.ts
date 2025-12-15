import { Auth0SubSchema, IDSchema } from '@downtown65/schema'
import { z } from 'zod'

export const UserSchema = z.object({
  nickname: z.string(),
  id: IDSchema,
  auth0Sub: Auth0SubSchema,
  picture: z.string(),
})

export type User = z.infer<typeof UserSchema>
