import z from 'zod'

export const UserUpdateParamsSchema = z
  .object({
    name: z.string().min(1).optional().openapi({ example: 'Ada Lovelace' }),
    nickname: z.string().min(1).optional().openapi({ example: 'ada' }),
    picture: z
      .httpUrl()
      .optional()
      .openapi({ example: 'https://example.com/avatar.jpg' }),
    subscribeEventCreationEmail: z
      .boolean()
      .optional()
      .openapi({ example: false }),
    subscribeWeeklyEmail: z.boolean().optional().openapi({ example: true }),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided to update user.',
  })

export type UserUpdateParams = z.infer<typeof UserUpdateParamsSchema>
