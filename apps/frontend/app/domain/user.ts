import { z } from 'zod'

export const UserSchema = z.object({
  nickname: z.string(),
  id: z.string(),
  picture: z.string(),
})

export type User = z.infer<typeof UserSchema>
