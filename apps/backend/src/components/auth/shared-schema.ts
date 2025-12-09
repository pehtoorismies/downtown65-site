import z from '../../../node_modules/zod/v4/classic/external.cjs'

export const ForgotPasswordParamSchema = z.object({
  email: z.email(),
})
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordParamSchema>

export const LoginParamSchema = z.object({
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
export type LoginInput = z.infer<typeof LoginParamSchema>

export const RefreshTokenParamSchema = z.object({
  refreshToken: z.string(),
})
export type RefreshTokenInput = z.infer<typeof RefreshTokenParamSchema>

export const RegisterParamSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  name: z.string().min(2),
  registerSecret: z.string(),
})
export type RegisterInput = z.infer<typeof RegisterParamSchema>
