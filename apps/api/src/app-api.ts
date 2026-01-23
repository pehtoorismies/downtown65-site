import type { OpenAPIHono } from '@hono/zod-openapi'

type Vars = {
  jwtPayload: {
    iss: string
    sub: string
    aud: string[]
    iat: number
    exp: number
    scope: string
    gty: string
    azp: string
  }
}

export type AppAPI = OpenAPIHono<{ Bindings: Env; Variables: Vars }>
