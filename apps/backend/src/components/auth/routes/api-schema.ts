import z from 'zod'

export const RegisterParamSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  name: z.string().min(2),
  registerSecret: z.string(),
})
export type RegisterInput = z.infer<typeof RegisterParamSchema>
