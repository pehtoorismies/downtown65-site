import type { OpenAPIHono } from '@hono/zod-openapi'
import type { ManagementClient } from 'auth0'
import { User } from './components/events/schema'
import type { UserStore } from './components/users/store'

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
  userStore: UserStore
}

export type AppAPI = OpenAPIHono<{ Bindings: Env; Variables: Vars }>
