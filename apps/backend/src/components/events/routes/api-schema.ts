import { StringIDSchema } from '@downtown65/schema'
import { z } from 'zod'

export const IDParamSchema = z
  .object({
    id: StringIDSchema,
  })
  .openapi({
    param: {
      name: 'id',
      in: 'path',
    },
    example: '1212121',
  })
