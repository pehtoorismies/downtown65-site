import { createLogger } from '@downtown65/logger'
import z from 'zod'
import { getManagementClient } from '~/common/auth0/client'
import type { Config } from '~/common/config/config'
import { getDb } from '~/common/db/get-db'
import { Auth0SubSchema, IDSchema } from '~/common/schema'
import { usersTable } from '~/db/schema'
import type { RegisterInput } from '../shared-schema'
import { Auth0ErrorSchema } from './support/auth0-error'

const CreateAuth0UserResponseSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('Error'), error: z.string(), statusCode: z.number() }),
  z.object({
    type: z.literal('Success'),
    user: z.object({
      auth0Sub: Auth0SubSchema,
      email: z.email(),
      nickname: z.string(),
      picture: z.url(),
    }),
  }),
])

type CreateAuth0UserResponse = z.infer<typeof CreateAuth0UserResponseSchema>

const SignupResponseSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('Error'), error: z.string(), statusCode: z.number() }),
  z.object({
    type: z.literal('Success'),
    user: z.object({
      id: IDSchema,
      email: z.email(),
      nickname: z.string(),
    }),
  }),
])

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

    return {
      type: 'Success',
      user: {
        auth0Sub: Auth0SubSchema.parse(auth0User.user_id),
        email: input.email,
        nickname: input.nickname,
        picture: auth0User.picture || '',
      },
    }
  } catch (error: unknown) {
    const result = Auth0ErrorSchema.safeParse(error)
    if (result.success) {
      return {
        type: 'Error',
        error: result.data.message,
        statusCode: result.data.statusCode,
      }
    }
    logger.error(error, 'Error during Auth0 user creation')

    return {
      type: 'Error',
      statusCode: 500,
      error: 'An unknown error occurred during signup.',
    }
  }
}

const updateAuth0User = async (config: Config, auth0Sub: string, localUserId: number) => {
  try {
    const management = await getManagementClient(config)
    await management.users.update(auth0Sub, {
      app_metadata: { localUserId },
    })
    return true
  } catch (error: unknown) {
    const logger = createLogger()
    logger.error(error, 'Error during Auth0 user update')
    return false
  }
}

interface LocalUser {
  auth0Sub: string
  nickname: string
  picture: string
}

const createLocalUser = async (config: Config, values: LocalUser) => {
  const db = getDb(config.D1_DB)
  try {
    const result = await db.insert(usersTable).values(values).returning({ id: usersTable.id })
    return result[0].id
  } catch (error: unknown) {
    const logger = createLogger()
    logger.error(error, 'Error during local user creation')

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

  const localUserId = await createLocalUser(config, {
    auth0Sub: result.user.auth0Sub,
    nickname: result.user.nickname,
    picture: result.user.picture,
  })

  if (localUserId === undefined) {
    logger.fatal(result.user, 'Failed to create local user after successful Auth0 signup')
    return {
      type: 'Error',
      error: 'Failed to create local user but account was created in Auth0.',
      statusCode: 500,
    }
  }

  const updated = await updateAuth0User(config, result.user.auth0Sub, localUserId)

  if (updated === false) {
    logger.fatal(result.user, 'Failed to update Auth0 user with local user ID after signup')
    return {
      type: 'Error',
      error: 'Failed to update Auth0 user but account and local user were created.',
      statusCode: 500,
    }
  }

  return {
    type: 'Success',
    user: {
      id: localUserId,
      email: result.user.email,
      nickname: result.user.nickname,
    },
  }
}
