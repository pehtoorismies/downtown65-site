import type { ForgotPasswordInput } from '../schema'
import type { AuthConfig } from './misc/auth-config'
import { createAuthClient } from './misc/client'

export const forgotPassword =
  (config: AuthConfig) =>
  async (input: ForgotPasswordInput): Promise<void> => {
    try {
      const authClient = createAuthClient(config)
      await authClient.database.changePassword({
        email: input.email,
        connection: 'Username-Password-Authentication',
      })
    } catch (error) {
      throw new Error('Password reset failed')
    }
  }
