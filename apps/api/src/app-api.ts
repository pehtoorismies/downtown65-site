import type { Logger } from '@downtown65/logger'
import type { OpenAPIHono } from '@hono/zod-openapi'
import type { AuthConfig } from '~/common/config/config'
import type { SaasUserService } from '~/common/services/saas-user-service'

export interface RequestContext {
  db: D1Database
  logger: Logger
  apiKey: string
  authConfig: AuthConfig
  registerSecret: string
  userService: SaasUserService
}

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
    permissions?: string[]
  }
  requestContext: RequestContext
}

export type AppAPI = OpenAPIHono<{ Bindings: Env; Variables: Vars }>
