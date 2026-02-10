import { z } from 'zod'

export const ForgotPasswordParamSchema = z.object({
  email: z.email(),
})
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordParamSchema>

export const LoginParamSchema = z.object({
  email: z.email().openapi({
    example: 'me@example.com',
    param: {
      in: 'path',
      name: 'email',
    },
  }),
  password: z
    .string()
    .min(2)
    .openapi({
      example: 'supersecretpassword',
      param: {
        in: 'path',
        name: 'password',
      },
    }),
})
export type LoginInput = z.infer<typeof LoginParamSchema>

export const RefreshTokenParamSchema = z.object({
  refreshToken: z.string(),
})
export type RefreshTokenInput = z.infer<typeof RefreshTokenParamSchema>

export const RegisterParamSchema = z.object({
  email: z.email(),
  name: z.string().min(2),
  nickname: z.string().min(2),
  password: z.string().min(8),
  registerSecret: z.string(),
})
export type RegisterInput = z.infer<typeof RegisterParamSchema>
