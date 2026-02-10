import { z } from 'zod'

export const Auth0UserSchema = z
  .object({
    email: z.string(),
    name: z.string(),
    nickname: z.string(),
    picture: z.string(),
    sub: z.string(),
  })
  .transform(({ sub, ...rest }) => ({
    auth0Sub: sub,
    ...rest,
  }))

const Auth0TokensBaseSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  id_token: z.string(),
})

export const Auth0TokensSchema = Auth0TokensBaseSchema.extend({
  refresh_token: z.string(),
}).transform((tokens) => ({
  accessToken: tokens.access_token,
  expiresIn: tokens.expires_in,
  idToken: tokens.id_token,
  refreshToken: tokens.refresh_token,
}))

export const Auth0TokensRefreshSchema = Auth0TokensBaseSchema.transform(
  (tokens) => ({
    accessToken: tokens.access_token,
    expiresIn: tokens.expires_in,
    idToken: tokens.id_token,
  }),
)

export type Auth0TokensRefresh = z.infer<typeof Auth0TokensRefreshSchema>
