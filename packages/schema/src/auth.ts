import { z } from 'zod'

export const ErrorResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
})

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>

export const LoginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})
export type Login = z.infer<typeof LoginSchema>
