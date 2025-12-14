import { z } from 'zod'

export const LoginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string('Password required'),
  rememberMe: z.string().nullable().optional(),
})
export type Login = z.infer<typeof LoginSchema>
