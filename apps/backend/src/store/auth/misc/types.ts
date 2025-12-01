import { z } from 'zod'

export const auth0UserSchema = z
  .object({
    sub: z.string(),
    email: z.string(),
    name: z.string(),
    nickname: z.string(),
    picture: z.string(),
  })
  .transform(({ sub, ...rest }) => ({
    id: sub,
    ...rest,
  }))

export type User = z.infer<typeof auth0UserSchema>

export const authTokenSchema = z
  .object({
    access_token: z.string(),
    id_token: z.string(),
    expires_in: z.number(),
    refresh_token: z.string(),
  })
  .transform((tokens) => ({
    accessToken: tokens.access_token,
    idToken: tokens.id_token,
    expiresIn: tokens.expires_in,
    refreshToken: tokens.refresh_token,
  }))

export type AuthTokens = z.infer<typeof authTokenSchema>

export type InvalidCredentialsError = {
  type: 'InvalidCredentials'
  error: string
}
