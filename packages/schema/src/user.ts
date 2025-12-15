import { z } from 'zod'

export const Auth0SubSchema = z.string().startsWith('auth0|')

export const IDSchema = z.number().int().positive()

export type Auth0Sub = z.infer<typeof Auth0SubSchema>
export type ID = z.infer<typeof IDSchema>

export const UserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  nickname: z.string().min(1),
})

export const DetailedUserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  nickname: z.string().min(1),
  email: z.email(),
  picture: z.url().optional(),
  createdAt: z.iso.datetime(),
  roles: z.array(z.string()),
  preferences: z.object({
    subscribeWeeklyEmail: z.boolean(),
    subscribeEventCreationEmail: z.boolean(),
  }),
})

export const UserUpdateSchema = z
  .object({
    name: z.string().min(1).optional(),
    nickname: z.string().min(1).optional(),
    picture: z.url().optional(),
    subscribeWeeklyEmail: z.boolean().optional(),
    subscribeEventCreationEmail: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  })

export const UserListSchema = z.array(UserSchema)

// ============================================
// Type Exports
// ============================================

export type User = z.infer<typeof UserSchema>
export type DetailedUser = z.infer<typeof DetailedUserSchema>
export type UserUpdate = z.infer<typeof UserUpdateSchema>
export type UserList = z.infer<typeof UserListSchema>
