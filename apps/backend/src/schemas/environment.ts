import { z } from 'zod'

export const environmentSchema = z.object({
  AUTH_DOMAIN: z.string().min(1),
  AUTH_CLIENT_ID: z.string().min(1),
  AUTH_CLIENT_SECRET: z.string().min(1),
  AUTH_AUDIENCE: z.string().url(),
  REGISTER_SECRET: z.string().min(1),
})

type Environment = z.infer<typeof environmentSchema>

// export function validateEnv(env: Env): EnvVars {
//   try {
//     return environmentSchema.parse(env)
//   } catch (error) {
//     console.error('Environment validation failed:', error)
//     throw new Error('Invalid environment configuration')
//   }
// }

// export function getAuthConfig(env: Env) {
//   const validatedEnv = validateEnv(env)

//   return {
//     AUTH_DOMAIN: validatedEnv.AUTH_DOMAIN,
//     AUTH_CLIENT_ID: validatedEnv.AUTH_CLIENT_ID,
//     AUTH_CLIENT_SECRET: validatedEnv.AUTH_CLIENT_SECRET,
//     AUTH_AUDIENCE: validatedEnv.AUTH_AUDIENCE,
//     REGISTER_SECRET: validatedEnv.REGISTER_SECRET,
//   }
// }
