import z from 'zod'

const EnvironmentSchema = z.object({
  AUTH_DOMAIN: z.string().min(1),
  AUTH_CLIENT_ID: z.string().min(1),
  AUTH_CLIENT_SECRET: z.string().min(1),
  AUTH_AUDIENCE: z.url(),
  REGISTER_SECRET: z.string().min(1),
  API_KEY: z.string().min(1),
  D1_DB: z.custom<D1Database>((val) => val != null && typeof val === 'object', {
    message: 'D1_DB binding is required',
  }),
})

interface AuthConfig {
  AUTH_DOMAIN: string
  AUTH_CLIENT_ID: string
  AUTH_CLIENT_SECRET: string
  AUTH_AUDIENCE: string
  REGISTER_SECRET: string
}

export interface Config {
  authConfig: AuthConfig
  API_KEY: string
  D1_DB: D1Database
}

export const getConfig = (env: Env): Config => {
  const validated = EnvironmentSchema.parse(env)
  return {
    authConfig: {
      AUTH_DOMAIN: validated.AUTH_DOMAIN,
      AUTH_CLIENT_ID: validated.AUTH_CLIENT_ID,
      AUTH_CLIENT_SECRET: validated.AUTH_CLIENT_SECRET,
      AUTH_AUDIENCE: validated.AUTH_AUDIENCE,
      REGISTER_SECRET: validated.REGISTER_SECRET,
    },
    API_KEY: validated.API_KEY,
    D1_DB: validated.D1_DB,
  }
}
