import type { Context, Next } from 'hono'
import { bearerAuth } from 'hono/bearer-auth'

/**
 * Middleware to validate x-api-key header
 * Returns 401 Unauthorized if the API key is missing or invalid
 */
export async function apiKeyAuth(c: Context<{ Bindings: Env }>, next: Next) {
  const middleware = bearerAuth({
    token: c.env.API_KEY,
    headerName: 'x-api-key',
    prefix: '', // no "Bearer " required, header value is the raw key
    // Optional: customize messages
    noAuthenticationHeader: {
      message: (c) => ({ error: 'Missing x-api-key header' }),
      wwwAuthenticateHeader: 'APIKey realm="global"',
    },
    invalidAuthenticationHeader: {
      message: (c) => ({ error: 'Invalid x-api-key header format' }),
      wwwAuthenticateHeader: 'APIKey realm="global"',
    },
    invalidToken: {
      message: (c) => ({ error: 'Invalid x-api-key key' }),
      wwwAuthenticateHeader: 'APIKey realm="global"',
    },
  })

  return middleware(c, next)
}
