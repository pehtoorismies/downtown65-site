import { environmentSchema } from '~/schemas/environment'

export const getAuthConfigFromEnv = (env: Env): AuthConfig => {
  const validated = environmentSchema.parse(env)

  return {
    AUTH_DOMAIN: validated.AUTH_DOMAIN,
    AUTH_CLIENT_ID: validated.AUTH_CLIENT_ID,
    AUTH_CLIENT_SECRET: validated.AUTH_CLIENT_SECRET,
    AUTH_AUDIENCE: validated.AUTH_AUDIENCE,
    REGISTER_SECRET: validated.REGISTER_SECRET,
  }
}

export interface AuthConfig {
  AUTH_DOMAIN: string
  AUTH_CLIENT_ID: string
  AUTH_CLIENT_SECRET: string
  AUTH_AUDIENCE: string
  REGISTER_SECRET: string
}
