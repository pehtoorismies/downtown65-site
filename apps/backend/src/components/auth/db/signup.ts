import { createLogger } from '@downtown65/logger'
import {
  type Auth0Sub,
  Auth0SubSchema,
  type ID,
  IDSchema,
} from '@downtown65/schema'
import z from 'zod'
import { getManagementClient } from '~/common/auth0/client'
import type { Config } from '~/common/config/config'
import { getDb } from '~/common/db/get-db'
import { usersTable } from '~/db/schema'
import type { RegisterInput } from '../shared-schema'
import { Auth0ErrorSchema } from './support/auth0-error'

const ErrorSchema = z.object({
  type: z.literal('Error'),
  error: z.string(),
  statusCode: z.number(),
})

const SignupUserSchema = z.object({
  email: z.email(),
  nickname: z.string(),
  picture: z.httpUrl(),
  auth0Sub: Auth0SubSchema,
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
  config: Config,
  input: Omit<RegisterInput, 'registerSecret'>,
): Promise<CreateAuth0UserResponse> => {
  const logger = createLogger()

  try {
    const management = await getManagementClient(config)

    const auth0User = await management.users.create({
      email: input.email,
      password: input.password,
      name: input.name,
      nickname: input.nickname,
      connection: 'Username-Password-Authentication',
      verify_email: true,
      email_verified: false,
      user_metadata: {
        subscribeWeeklyEmail: true,
        subscribeEventCreationEmail: true,
      },
      app_metadata: { role: 'USER' },
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
        type: 'Error',
        error: result.data.message,
        statusCode: result.data.statusCode,
      }
    }
    logger.withError(error).error('Error during Auth0 user creation')

    return {
      type: 'Error',
      statusCode: 500,
      error: 'An unknown error occurred during signup.',
    }
  }
}

const updateAuth0User = async (
  config: Config,
  auth0Sub: Auth0Sub,
  localUserId: ID,
) => {
  try {
    const management = await getManagementClient(config)
    await management.users.update(auth0Sub, {
      app_metadata: { localUserId },
    })
    return true
  } catch (error: unknown) {
    const logger = createLogger()
    logger.withError(error).error('Error during Auth0 user update')
    return false
  }
}

const createLocalUser = async (config: Config, values: LocalUser) => {
  const db = getDb(config.D1_DB)
  try {
    const result = await db
      .insert(usersTable)
      .values(values)
      .returning({ id: usersTable.id })
    return result[0].id
  } catch (error: unknown) {
    const logger = createLogger()
    logger.withError(error).error('Error during local user creation')

    return undefined
  }
}

type SignupResponse = z.infer<typeof SignupResponseSchema>

export const signup = async (
  config: Config,
  input: Omit<RegisterInput, 'registerSecret'>,
): Promise<SignupResponse> => {
  const logger = createLogger()

  const result = await createAuth0User(config, input)

  if (result.type === 'Error') {
    return result
  }

  const localUserId = await createLocalUser(
    config,
    LocalUserSchema.decode(result.user),
  )

  if (localUserId === undefined) {
    logger
      .withMetadata(result.user)
      .fatal('Failed to create local user after successful Auth0 signup')

    return {
      type: 'Error',
      error: 'Failed to create local user but account was created in Auth0.',
      statusCode: 500,
    }
  }

  const updated = await updateAuth0User(
    config,
    result.user.auth0Sub,
    localUserId,
  )

  if (updated === false) {
    logger
      .withMetadata(result.user)
      .fatal('Failed to update Auth0 user with local user ID after signup')

    return {
      type: 'Error',
      error:
        'Failed to update Auth0 user but account and local user were created.',
      statusCode: 500,
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
