import { createLogger } from '@downtown65/logger'
import { UserSchema } from '@downtown65/schema'
import { jwtDecode } from 'jwt-decode'
import { z } from 'zod'
import type { Config } from '~/common/config/config'
import { getDb } from '~/db/get-db'
import type { LoginInput } from '../shared-schema'
import { auth0Login } from './auth0-login'
import { Auth0TokensSchema, Auth0UserSchema } from './support/auth0-schema'

const LoginResponse = z.discriminatedUnion('type', [
  z.object({ type: z.literal('InvalidCredentials'), error: z.string() }),
  z.object({ type: z.literal('UnknownError'), error: z.string() }),
  z.object({ type: z.literal('AccessDenied'), error: z.string() }),
  z.object({
    type: z.literal('Success'),
    tokens: Auth0TokensSchema,
    user: UserSchema,
  }),
])

type LoginResponse = z.infer<typeof LoginResponse>

export const login = async (
  config: Config,
  input: LoginInput,
): Promise<LoginResponse> => {
  const logger = createLogger()

  const auth0 = await auth0Login(config, input)

  if (auth0.type !== 'Success') {
    return auth0
  }

  const { auth0Sub } = Auth0UserSchema.parse(jwtDecode(auth0.tokens.idToken))

  const db = getDb(config.D1_DB)
  const localUser = await db.query.users.findFirst({
    where: {
      auth0Sub,
    },
  })

  if (!localUser) {
    // TODO: insert if not found
    logger.fatal(
      `User not found locally after successful authentication: ${auth0Sub}`,
    )
    throw new Error('User not found locally after successful authentication')
  }
  return {
    type: 'Success',
    tokens: auth0.tokens,
    user: localUser,
  }
}
