import { IDSchema, ULIDSchema } from '@downtown65/schema'
import { z } from 'zod'

export const EventPathULIDParamSchema = z
  .object({
    eventULID: ULIDSchema,
  })
  .openapi({ description: 'ULID of the event' })

export const EventPathIDParamSchema = z.object({
  id: IDSchema,
})

export const MessageSchema = z.object({
  message: z.string().openapi({ example: 'Information regarding request' }),
})
