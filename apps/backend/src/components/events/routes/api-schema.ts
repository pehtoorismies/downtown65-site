import { StringIDSchema, ULIDSchema } from '@downtown65/schema'
import { z } from 'zod'

export const EventPathULIDParamSchema = z
  .object({
    eventULID: ULIDSchema,
  })
  .openapi({ description: 'ULID of the event' })

export const IDParamSchema = StringIDSchema.openapi({
  param: {
    name: 'id',
    in: 'path',
  },
  example: '1212121',
})

export const MessageSchema = z.object({
  message: z.string().openapi({ example: 'Information regarding request' }),
})
