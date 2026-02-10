import { Auth0SubSchema, IDSchema } from '@downtown65/schema'
import z from 'zod'
import type { RequestContext } from '~/app-api'
import { getManagementClient } from '~/common/auth0/client'
import { getDb } from '~/db/get-db'
import { users as usersTable } from '~/db/schema'
import type { RegisterInput } from '../shared-schema'
import { Auth0ErrorSchema } from './support/auth0-error'

const ErrorSchema = z.object({
  error: z.string(),
  statusCode: z.number(),
  type: z.literal('Error'),
})

const SignupUserSchema = z.object({
  auth0Sub: Auth0SubSchema,
  email: z.email(),
  nickname: z.string(),
  picture: z.httpUrl(),
})

const CreateAuth0UserResponseSchema = z.discriminatedUnion('type', [
  ErrorSchema,
  z.object({
    type: z.literal('Success'),
    user: SignupUserSchema,
  }),
])

type CreateAuth0UserResponse = z.infer<typeof CreateAuth0UserResponseSchema>

const SignupResponseSchema = z.discriminatedUnion('type', [
  ErrorSchema,
  z.object({
    type: z.literal('Success'),
    user: SignupUserSchema.extend({
      id: IDSchema,
    }),
  }),
])

const LocalUserSchema = SignupUserSchema.omit({ email: true })
type LocalUser = z.infer<typeof LocalUserSchema>

const createAuth0User = async (
  ctx: RequestContext,
  input: Omit<RegisterInput, 'registerSecret'>,
): Promise<CreateAuth0UserResponse> => {
  try {
    const management = await getManagementClient(ctx.authConfig)

    const auth0User = await management.users.create({
      app_metadata: { role: 'USER' },
      connection: 'Username-Password-Authentication',
      email: input.email,
      email_verified: false,
      name: input.name,
      nickname: input.nickname,
      password: input.password,
      user_metadata: {
        subscribeEventCreationEmail: true,
        subscribeWeeklyEmail: true,
      },
      verify_email: true,
    })

    return CreateAuth0UserResponseSchema.parse({
      type: 'Success',
      user: {
        ...auth0User,
        auth0Sub: auth0User.user_id,
      },
    })
  } catch (error: unknown) {
    const result = Auth0ErrorSchema.safeParse(error)
    if (result.success) {
      return {
        error: result.data.message,
        statusCode: result.data.statusCode,
        type: 'Error',
      }
    }
    ctx.logger.withError(error).error('Error during Auth0 user creation')

    return {
      error: 'An unknown error occurred during signup.',
      statusCode: 500,
      type: 'Error',
    }
  }
}

const createLocalUser = async (ctx: RequestContext, values: LocalUser) => {
  const db = getDb(ctx.db)
  try {
    const result = await db
      .insert(usersTable)
      .values(values)
      .returning({ id: usersTable.id })
    return result[0].id
  } catch (error: unknown) {
    ctx.logger.withError(error).error('Error during local user creation')

    return undefined
  }
}

type SignupResponse = z.infer<typeof SignupResponseSchema>

export const signup = async (
  ctx: RequestContext,
  input: Omit<RegisterInput, 'registerSecret'>,
): Promise<SignupResponse> => {
  const result = await createAuth0User(ctx, input)

  if (result.type === 'Error') {
    return result
  }

  const localUserId = await createLocalUser(
    ctx,
    LocalUserSchema.decode(result.user),
  )

  if (localUserId === undefined) {
    ctx.logger
      .withMetadata(result.user)
      .fatal('Failed to create local user after successful Auth0 signup')

    return {
      error: 'Failed to create local user but account was created in Auth0.',
      statusCode: 500,
      type: 'Error',
    }
  }

  return SignupResponseSchema.decode({
    type: 'Success',
    user: {
      id: localUserId,
      ...result.user,
    },
  })
}
