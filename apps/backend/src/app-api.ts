import type { OpenAPIHono } from '@hono/zod-openapi'

export type AppAPI = OpenAPIHono<{ Bindings: Env }>
