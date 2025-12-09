import { z } from 'zod'
import { ULID } from '../shared-schema'

export const EventPathULIDParamSchema = z
  .object({
    eventULID: ULID,
  })
  .openapi({ description: 'ULID of the event' })

export const EventPathIDParamSchema = z.object({
  id: z.number().int().positive().openapi({ example: 123, description: 'ID of the event' }),
})

export const MessageSchema = z.object({
  message: z.string().openapi({ example: 'Information regarding request' }),
})
