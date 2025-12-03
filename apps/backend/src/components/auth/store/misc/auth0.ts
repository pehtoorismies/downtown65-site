import { z } from 'zod'

export const Auth0UserSchema = z
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

export type Auth0User = z.infer<typeof Auth0UserSchema>

const Auth0TokensBaseSchema = z.object({
  access_token: z.string(),
  id_token: z.string(),
  expires_in: z.number(),
})

export const Auth0TokensSchema = Auth0TokensBaseSchema.extend({
  refresh_token: z.string(),
}).transform((tokens) => ({
  accessToken: tokens.access_token,
  idToken: tokens.id_token,
  expiresIn: tokens.expires_in,
  refreshToken: tokens.refresh_token,
}))

export const Auth0TokensRefreshSchema = Auth0TokensBaseSchema.transform((tokens) => ({
  accessToken: tokens.access_token,
  idToken: tokens.id_token,
  expiresIn: tokens.expires_in,
}))

export type Auth0Tokens = z.infer<typeof Auth0TokensSchema>
export type Auth0TokensRefresh = z.infer<typeof Auth0TokensRefreshSchema>

export type InvalidCredentialsError = {
  type: 'InvalidCredentials'
  error: string
}
