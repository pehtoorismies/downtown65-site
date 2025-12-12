import { z } from 'zod'

export const ErrorAPIResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
})

export type ErrorAPIResponse = z.infer<typeof ErrorAPIResponseSchema>
