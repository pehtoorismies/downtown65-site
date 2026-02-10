// Validation error schema
import { z } from '@hono/zod-openapi'

export const ValidationErrorSchema = z.object({
  errors: z.array(
    z.object({
      message: z.string(),
      path: z.array(z.string()),
    }),
  ),
  message: z.string().openapi({ example: 'Validation failed' }),
})

export const formatZodErrors = (error: z.ZodError) => {
  return error.issues.map((err) => ({
    message: err.message,
    path: err.path.map(String),
  }))
}
