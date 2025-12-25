// Validation error schema
import { z } from '@hono/zod-openapi'

export const ValidationErrorSchema = z.object({
  message: z.string().openapi({ example: 'Validation failed' }),
  errors: z.array(
    z.object({
      path: z.array(z.string()),
      message: z.string(),
    }),
  ),
})

export const formatZodErrors = (error: z.ZodError) => {
  return error.issues.map((err) => ({
    path: err.path.map(String),
    message: err.message,
  }))
}
