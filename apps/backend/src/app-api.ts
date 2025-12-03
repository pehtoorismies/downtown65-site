import type { OpenAPIHono } from '@hono/zod-openapi'

type Vars = {
  jwtPayload: string
}

export type AppAPI = OpenAPIHono<{ Bindings: Env; Variables: Vars }>
