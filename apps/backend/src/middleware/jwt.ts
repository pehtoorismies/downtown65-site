import type { Context, Next } from 'hono'
import { jwk } from 'hono/jwk'

interface JwtAuthOptions {
  allowAnon?: boolean
}

export const jwtToken =
  (options: JwtAuthOptions = {}) =>
  async (c: Context<{ Bindings: Env }>, next: Next) => {
    const { allowAnon = false } = options
    const middleware = jwk({
      jwks_uri: (c) => `https://${c.env.AUTH_DOMAIN}/.well-known/jwks.json`,
      allow_anon: allowAnon,
    })
    return middleware(c, next)
  }
