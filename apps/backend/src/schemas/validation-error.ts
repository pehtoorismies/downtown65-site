// Validation error schema
import { z } from '@hono/zod-openapi'

export const ValidationErrorSchema = z.object({
  //   ok: z.boolean().openapi({ example: false }),
  //   code: z.number().openapi({ example: 422 }),
  message: z.string().openapi({ example: 'Validation failed' }),
  errors: z.array(
    z.object({
      path: z.array(z.string()),
      message: z.string(),
    }),
  ),
})

// export const validationErrorSchemaJSON = {
//   type: 'object',
//   properties: {
//     ok: { type: 'boolean', example: false },
//     code: { type: 'number', example: 422 },
//     message: { type: 'string', example: 'Validation failed' },
//     errors: {
//       type: 'array',
//       items: {
//         type: 'object',
//         properties: {
//           path: { type: 'array', items: { type: 'string' } },
//           message: { type: 'string' },
//         },
//         required: ['path', 'message'],
//       },
//     },
//   },
//   required: ['ok', 'code', 'message', 'errors'],
// }

export const formatZodErrors = (error: z.ZodError) => {
  return error.issues.map((err) => ({
    path: err.path.map(String),
    message: err.message,
  }))
}
