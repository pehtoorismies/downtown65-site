import { getManagementClient } from '~/common/auth0/client'
import type { Config } from '~/common/config/config'
import type { RegisterInput } from '../shared-schema'

export const register = async (config: Config, input: RegisterInput): Promise<void> => {
  try {
    const management = await getManagementClient(config.authConfig)

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
  } catch {
    throw new Error('Registration failed')
  }
}
