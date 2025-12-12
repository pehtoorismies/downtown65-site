import z from 'zod'

export const PaginationQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Number.parseInt(val, 10) : 1))
    .openapi({ example: '1', description: 'Page number' }),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Number.parseInt(val, 10) : 10))
    .openapi({ example: '10', description: 'Items per page' }),
})

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>

export const UserUpdateParamsSchema = z
  .object({
    // email: z.email().optional().openapi({ example: 'ada@example.com' }),
    name: z.string().min(1).optional().openapi({ example: 'Ada Lovelace' }),
    nickname: z.string().min(1).optional().openapi({ example: 'ada' }),
    picture: z
      .url()
      .optional()
      .openapi({ example: 'https://example.com/avatar.jpg' }),
    subscribeWeeklyEmail: z.boolean().optional().openapi({ example: true }),
    subscribeEventCreationEmail: z
      .boolean()
      .optional()
      .openapi({ example: false }),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided to update user.',
  })

export type UserUpdateParams = z.infer<typeof UserUpdateParamsSchema>
