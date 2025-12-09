import { z } from 'zod'

export const ErrorAPIResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
})

export const Auth0SubSchema = z
  .string()
  .startsWith('auth0|')
  .openapi({ example: 'auth0|1234567890' })
export const IDSchema = z.number().int().positive().openapi({ example: 1 })
