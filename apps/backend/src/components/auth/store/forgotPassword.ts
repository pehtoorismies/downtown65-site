import type { AuthConfig } from '~/common/auth0/auth-config'
import { createAuthClient } from '~/common/auth0/client'
import type { ForgotPasswordInput } from '../schema'

export const forgotPassword =
  (config: AuthConfig) =>
  async (input: ForgotPasswordInput): Promise<void> => {
    try {
      const authClient = createAuthClient(config)
      await authClient.database.changePassword({
        email: input.email,
        connection: 'Username-Password-Authentication',
      })
    } catch {
      throw new Error('Password reset failed')
    }
  }
