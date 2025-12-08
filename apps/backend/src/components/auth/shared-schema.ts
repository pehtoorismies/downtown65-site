import z from 'zod'

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
