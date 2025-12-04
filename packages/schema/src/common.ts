import { z } from 'zod'

/**
 * Time in HH:MM format (00:00 - 23:59)
 */
export const TimeHHMM = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Must be HH:MM (00–23:59)')

export type TimeHHMM = z.infer<typeof TimeHHMM>
