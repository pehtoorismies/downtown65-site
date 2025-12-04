import z from 'zod'

// Schemas
export const LoginSchema = z.object({
  email: z.email().openapi({
    param: {
      name: 'email',
      in: 'path',
    },
    example: 'me@example.com',
  }),
  password: z
    .string()
    .min(2)
    .openapi({
      param: {
        name: 'password',
        in: 'path',
      },
      example: 'supersecretpassword',
    }),
})
export type LoginInput = z.infer<typeof LoginSchema>

export const RegisterSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  name: z.string().min(2),
  registerSecret: z.string(),
})
export type RegisterInput = z.infer<typeof RegisterSchema>

export const ForgotPasswordSchema = z.object({
  email: z.email(),
})
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>

export const RefreshTokenSchema = z.object({
  refreshToken: z.string(),
})
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>

export const ErrorSchema = z.object({
  code: z.number().openapi({
    example: 400,
  }),
  message: z.string().openapi({
    example: 'Bad Request',
  }),
})
