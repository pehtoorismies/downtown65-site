import z from 'zod'

export const UnauthorizedErrorSchema = z.object({
  message: z.string().openapi({
    example: 'Unauthorized, wrong or missing API key',
  }),
})
