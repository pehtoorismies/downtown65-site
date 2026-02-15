import { UserSchema } from '@downtown65/schema'
import { jwtDecode } from 'jwt-decode'
import { z } from 'zod'
import type { RequestContext } from '~/app-api'
import { getDb } from '~/db/get-db'
import type { LoginInput } from '../shared-schema'
import { auth0Login } from './auth0-login'
import { Auth0TokensSchema, Auth0UserSchema } from './support/auth0-schema'

const LoginResponse = z.discriminatedUnion('type', [
  z.object({ error: z.string(), type: z.literal('InvalidCredentials') }),
  z.object({ error: z.string(), type: z.literal('UnknownError') }),
  z.object({ error: z.string(), type: z.literal('AccessDenied') }),
  z.object({
    tokens: Auth0TokensSchema,
    type: z.literal('Success'),
    user: UserSchema,
  }),
])

type LoginResponse = z.infer<typeof LoginResponse>

export const login = async (
  ctx: RequestContext,
  input: LoginInput,
): Promise<LoginResponse> => {
  try {
    const logger = ctx.logger.child().withContext({ db: 'login' })
    const auth0 = await auth0Login(ctx, input)
    logger.withMetadata({ auth0 }).info('Auth0 login attempt')

    if (auth0.type !== 'Success') {
      return auth0
    }

    const { auth0Sub } = Auth0UserSchema.parse(jwtDecode(auth0.tokens.idToken))

    const db = getDb(ctx.db)
    const localUser = await db.query.users.findFirst({
      where: {
        auth0Sub,
      },
    })

    if (!localUser) {
      // TODO: insert if not found
      ctx.logger.fatal(
        `User not found locally after successful authentication: ${auth0Sub}`,
      )
      throw new Error('User not found locally after successful authentication')
    }

    const { auth0Sub: sub, ...rest } = localUser

    return {
      tokens: auth0.tokens,
      type: 'Success',
      user: { ...rest, sub },
    }
  } catch (error) {
    ctx.logger.withError(error as Error).error('Unknown error during login')

    return {
      error: error instanceof Error ? error.message : String(error),
      type: 'UnknownError',
    }
  }
}
