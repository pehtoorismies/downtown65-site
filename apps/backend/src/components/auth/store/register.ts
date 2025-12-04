import type { AuthConfig } from '~/common/auth0/auth-config'
import { getManagementClient } from '~/common/auth0/client'
import type { RegisterInput } from '../schema'

export const register =
  (config: AuthConfig) =>
  async (input: RegisterInput): Promise<void> => {
    try {
      const management = await getManagementClient(config)

      await management.users.create({
        email: input.email,
        password: input.password,
        name: input.name,
        connection: 'Username-Password-Authentication',
        verify_email: true,
        email_verified: false,
        user_metadata: {
          subscribeWeeklyEmail: true,
          subscribeEventCreationEmail: true,
        },
        app_metadata: { role: 'USER' },
      })
    } catch (error) {
      throw new Error('Registration failed')
    }
  }
