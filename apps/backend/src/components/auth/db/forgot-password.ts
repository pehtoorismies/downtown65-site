import { createAuthClient } from '~/common/auth0/client'
import type { Config } from '~/common/config/config'
import type { ForgotPasswordInput } from '../shared-schema'

export const forgotPassword = async (config: Config, input: ForgotPasswordInput): Promise<void> => {
  try {
    const authClient = createAuthClient(config.authConfig)
    await authClient.database.changePassword({
      email: input.email,
      connection: 'Username-Password-Authentication',
    })
  } catch {
    throw new Error('Password reset failed')
  }
}
