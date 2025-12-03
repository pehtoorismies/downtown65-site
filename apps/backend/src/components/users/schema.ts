import { z } from '@hono/zod-openapi'

export const PaginationQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Number.parseInt(val, 10) : 1))
    .openapi({ example: '1', description: 'Page number' }),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Number.parseInt(val, 10) : 10))
    .openapi({ example: '10', description: 'Items per page' }),
})

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>

export const UserSchema = z
  .object({
    user_id: z.string(),
    name: z.string(),
    nickname: z.string(),
    email: z.string(),
    picture: z.string(),
    created_at: z.iso.datetime(),
  })
  .transform((obj) => ({
    id: obj.user_id,
    name: obj.name,
    nickname: obj.nickname,
    email: obj.email,
    picture: obj.picture,
    createdAt: obj.created_at,
  }))

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
export type UserList = z.infer<typeof UserListSchema>
export type UserUpdateInput = z.infer<typeof UserUpdateSchema>
