import { AuthApiError, AuthenticationClient, ManagementClient } from 'auth0'
import type { TokenSet } from 'auth0'
import { jwtDecode } from 'jwt-decode'
import { z } from 'zod'
import { ca } from 'zod/v4/locales'
import type {
  ForgotPasswordInput,
  LoginInput,
  RefreshTokenInput,
  RegisterInput,
} from '../routes/auth'

interface AuthConfig {
  AUTH_DOMAIN: string
  AUTH_CLIENT_ID: string
  AUTH_CLIENT_SECRET: string
  AUTH_AUDIENCE: string
  REGISTER_SECRET: string
}

const auth0UserSchema = z
  .object({
    sub: z.string(),
    email: z.string().optional(),
    name: z.string().optional(),
    nickname: z.string().optional(),
    picture: z.string().optional(),
  })
  .transform(({ sub, ...rest }) => ({
    id: sub,
    ...rest,
  }))

export type User = z.infer<typeof auth0UserSchema>

type InvalidCredentialsError = {
  type: 'InvalidCredentials'
  error: string
}
type UnknownError = {
  type: 'UnknownError'
  error: string
}
type AccessDeniedError = {
  type: 'AccessDenied'
  error: string
}

type LoginSuccess = {
  type: 'Success'
  tokens: AuthTokens
  user: User
}

type LoginResponse = InvalidCredentialsError | UnknownError | AccessDeniedError | LoginSuccess

const authTokenSchema = z
  .object({
    access_token: z.string(),
    id_token: z.string(),
    expires_in: z.number(),
    refresh_token: z.string(),
  })
  .transform((tokens) => {
    return {
      accessToken: tokens.access_token,
      idToken: tokens.id_token,
      expiresIn: tokens.expires_in,
      refreshToken: tokens.refresh_token,
    }
  })

export type AuthTokens = z.infer<typeof authTokenSchema>

export class AuthStore {
  private config: AuthConfig
  private authClient: AuthenticationClient

  private async getManagementClient(): Promise<ManagementClient> {
    const tokenResult = await this.authClient.oauth.clientCredentialsGrant({
      audience: `https://${this.config.AUTH_DOMAIN}/api/v2/`,
    })

    return new ManagementClient({
      token: tokenResult.data.access_token,
      domain: this.config.AUTH_DOMAIN,
    })
  }

  constructor(config: AuthConfig) {
    this.config = config
    this.authClient = new AuthenticationClient({
      domain: config.AUTH_DOMAIN,
      clientId: config.AUTH_CLIENT_ID,
      clientSecret: config.AUTH_CLIENT_SECRET,
    })
  }

  async login(input: LoginInput): Promise<LoginResponse> {
    try {
      const result = await this.authClient.oauth.passwordGrant({
        username: input.email,
        password: input.password,
        audience: this.config.AUTH_AUDIENCE,
        scope:
          'read:events write:events read:me write:me read:users openid profile email offline_access',
      })

      const tokens = authTokenSchema.parse(result.data)
      const user = auth0UserSchema.parse(jwtDecode(tokens.idToken))

      return {
        type: 'Success',
        tokens,
        user,
      }
    } catch (error: unknown) {
      if (error instanceof AuthApiError) {
        switch (error.error) {
          case 'invalid_grant':
            return {
              type: 'InvalidCredentials',
              error: error.error_description,
            }
          case 'access_denied':
            return {
              type: 'AccessDenied',
              error: error.error_description,
            }
          default:
            return {
              type: 'UnknownError',
              error: error.error_description,
            }
        }
      }

      return {
        type: 'UnknownError',
        error: 'An unknown error occurred during login.',
      }
    }
  }

  async register(input: RegisterInput): Promise<void> {
    try {
      // Get management client
      const management = await this.getManagementClient()

      // Create user in Auth0
      const createdUser = await management.users.create({
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

      // Login the newly created user
      //   return await this.login({
      //     email: input.email,
      //     password: input.password,
      //   })
    } catch (error) {
      throw new Error('Registration failed')
    }
  }

  async refreshToken(input: RefreshTokenInput): Promise<AuthTokens> {
    try {
      const result = await this.authClient.oauth.refreshTokenGrant({
        refresh_token: input.refreshToken,
      })
      return authTokenSchema.parse(result.data)
    } catch (error) {
      throw new Error('Token refresh failed')
    }
  }
  async forgotPassword(input: ForgotPasswordInput): Promise<void> {
    try {
      await this.authClient.database.changePassword({
        email: input.email,
        connection: 'Username-Password-Authentication',
      })
    } catch (error) {
      throw new Error('Password reset failed')
    }
  }
  async logout(accessToken: string): Promise<void> {
    // Auth0 doesn't require server-side logout for JWTs
    // Token invalidation happens client-side
    // Optionally, you could blacklist tokens here
    return Promise.resolve()
  }
}
// // Factory function to create auth store with environment config
// export const createAuthStore = (env: Env): AuthStore => {
//   return new AuthStore({
//     AUTH_DOMAIN: env.AUTH_DOMAIN,
//     AUTH_CLIENT_ID: env.AUTH_CLIENT_ID,
//     AUTH_CLIENT_SECRET: env.AUTH_CLIENT_SECRET,
//     AUTH_AUDIENCE: env.AUTH_AUDIENCE,
//     REGISTER_SECRET: env.REGISTER_SECRET,
//   })
// }
