import { z } from '@hono/zod-openapi'

export const UserSchema = z.object({
  id: z.string().min(1).openapi({ example: 'auth0|123456789' }),
  email: z.string().email().openapi({ example: 'ada@example.com' }),
  name: z.string().min(1).openapi({ example: 'Ada Lovelace' }),
  nickname: z.string().min(1).openapi({ example: 'ada' }),
  picture: z.string().url().optional().openapi({ example: 'https://example.com/avatar.jpg' }),
})

export const UserListSchema = z.array(UserSchema)

export const UserUpdateSchema = z
  .object({
    name: z.string().min(1).optional().openapi({ example: 'Ada Lovelace' }),
    nickname: z.string().min(1).optional().openapi({ example: 'ada' }),
    picture: z.string().url().optional().openapi({ example: 'https://example.com/avatar.jpg' }),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided to update user.',
  })

export type User = z.infer<typeof UserSchema>
export type UserUpdateInput = z.infer<typeof UserUpdateSchema>
