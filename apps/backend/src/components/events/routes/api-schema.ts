import { StringIDSchema, ULIDSchema } from '@downtown65/schema'
import { z } from 'zod'

export const EventPathULIDParamSchema = z
  .object({
    eventULID: ULIDSchema,
  })
  .openapi({ description: 'ULID of the event' })

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
