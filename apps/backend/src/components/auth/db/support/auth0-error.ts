import z from 'zod'

export const Auth0ErrorSchema = z
  .object({
    statusCode: z.int().positive(),
    body: z.object({
      statusCode: z.int().positive(),
      error: z.string(),
      errorCode: z.string(),
      message: z.string(),
    }),
  })
  .transform((obj) => ({
    statusCode: obj.statusCode,
    error: obj.body.error,
    errorCode: obj.body.errorCode,
    message: obj.body.message,
  }))

export type Auth0Error = z.infer<typeof Auth0ErrorSchema>

export const isAuth0Error = (error: unknown): error is Auth0Error => {
  const parseResult = Auth0ErrorSchema.safeParse(error)
  return parseResult.success
}
