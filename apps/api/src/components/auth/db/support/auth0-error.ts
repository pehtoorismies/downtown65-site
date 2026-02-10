import z from 'zod'

export const Auth0ErrorSchema = z
  .object({
    body: z.object({
      error: z.string(),
      errorCode: z.string(),
      message: z.string(),
      statusCode: z.int().positive(),
    }),
    statusCode: z.int().positive(),
  })
  .transform((obj) => ({
    error: obj.body.error,
    errorCode: obj.body.errorCode,
    message: obj.body.message,
    statusCode: obj.statusCode,
  }))
