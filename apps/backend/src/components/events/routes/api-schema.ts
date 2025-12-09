import { z } from 'zod'
import { ULID } from '../shared-schema'

export const EventPathParamSchema = z.object({
  eventULID: ULID,
})

export const MessageSchema = z.object({
  message: z.string().openapi({ example: 'Information regarding request' }),
})
