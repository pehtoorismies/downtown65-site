import z from 'zod'

const EnvironmentSchema = z.object({
  AUTH_DOMAIN: z.string().min(1),
  AUTH_CLIENT_ID: z.string().min(1),
  AUTH_CLIENT_SECRET: z.string().min(1),
  AUTH_AUDIENCE: z.url(),
  REGISTER_SECRET: z.string().min(1),
})

export const getAuthConfigFromEnv = (env: Env): AuthConfig => {
  const validated = EnvironmentSchema.parse(env)

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
