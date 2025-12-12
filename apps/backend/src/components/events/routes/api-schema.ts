import { z } from 'zod'
import { IDSchema } from '~/common/schema'
import { ULID } from '../shared-schema'

export const EventPathULIDParamSchema = z
  .object({
    eventULID: ULID,
  })
  .openapi({ description: 'ULID of the event' })

export const EventPathIDParamSchema = z.object({
  id: IDSchema,
})

export const MessageSchema = z.object({
  message: z.string().openapi({ example: 'Information regarding request' }),
})
