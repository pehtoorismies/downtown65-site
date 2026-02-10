import { Levels } from '@downtown65/logger'
import z from 'zod'

const AuthConfigSchema = z
  .object({
    AUTH_AUDIENCE: z.url(),
    AUTH_CLIENT_ID: z.string().min(1),
    AUTH_CLIENT_SECRET: z.string().min(1),
    AUTH_DOMAIN: z.string().min(1),
  })
  .transform((env) => ({
    audience: env.AUTH_AUDIENCE,
    clientId: env.AUTH_CLIENT_ID,
    clientSecret: env.AUTH_CLIENT_SECRET,
    domain: env.AUTH_DOMAIN,
  }))

export const ConfigSchema = z
  .object({
    API_KEY: z.string().min(1),
    AUTH_AUDIENCE: z.url(),
    AUTH_CLIENT_ID: z.string().min(1),
    AUTH_CLIENT_SECRET: z.string().min(1),
    AUTH_DOMAIN: z.string().min(1),
    D1_DB: z.custom<D1Database>(
      (val) => val != null && typeof val === 'object',
      {
        message: 'D1_DB binding is required',
      },
    ),
    LOG_LEVEL: z.enum(Levels),
    REGISTER_SECRET: z.string().min(1),
  })
  .transform((env) => ({
    apiKey: env.API_KEY,
    authConfig: AuthConfigSchema.parse(env),
    db: env.D1_DB,
    logLevel: env.LOG_LEVEL,
    registerSecret: env.REGISTER_SECRET,
  }))

export type AuthConfig = z.infer<typeof AuthConfigSchema>
