import { isValid as isValidULID } from 'ulidx'
import { z } from 'zod'

export const ULID = z
  .string()
  .refine((v) => {
    return isValidULID(v)
  }, 'Invalid ULID')
  .openapi({
    description: 'Id is ULID. ULIDs are Universally Unique Lexicographically Sortable Identifiers.',
    example: '01KBAWMEFMZTHDD52MA2D8PTDY',
  })

export type ULID = z.infer<typeof ULID>
