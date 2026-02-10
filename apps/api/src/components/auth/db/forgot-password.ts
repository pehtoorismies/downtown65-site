import type { RequestContext } from '~/app-api'
import { createAuthClient } from '~/common/auth0/client'
import type { ForgotPasswordInput } from '../shared-schema'

export const forgotPassword = async (
  ctx: RequestContext,
  input: ForgotPasswordInput,
): Promise<void> => {
  try {
    const authClient = createAuthClient(ctx.authConfig)
    await authClient.database.changePassword({
      connection: 'Username-Password-Authentication',
      email: input.email,
    })
  } catch (error) {
    ctx.logger.withError(error as Error).error('Password reset failed')
    throw new Error('Password reset failed')
  }
}
