import { addDays, addMonths, isAfter, parseISO } from 'date-fns'
import { jwtDecode } from 'jwt-decode'
import { type AppLoadContext, createCookieSessionStorage, redirect } from 'react-router'
import { z } from 'zod'
import { apiClient } from '~/api/api-client'
import { type User, UserSchema } from '~/domain/user'
import {
  CookieSessionDataSchema,
  getCookieSessionData,
  setCookieSessionData,
} from './cookie-session-data'

const Jwt = z.object({
  exp: z.number(),
})

const Tokens = z.object({
  refreshToken: z.string(),
  accessToken: z.string(),
  idToken: z.string(),
})

type Tokens = z.infer<typeof Tokens>

interface CreateUserSessionProps {
  tokens: Tokens
  redirectTo: string
  rememberMe: boolean
}

const getUserFromIdToken = (idTokenJWT: string): User => {
  const decoded = jwtDecode(idTokenJWT)
  return UserSchema.parse({
    ...decoded,
    id: decoded.sub,
  })
}

const isSessionExpired = (accessToken: string): boolean => {
  const decoded = jwtDecode(accessToken)
  const { exp } = Jwt.parse(decoded)

  const expirationDate = new Date(exp * 1000)
  const now = new Date()
  return isAfter(now, expirationDate)
}

export const createSessionManager = (request: Request, ctx: AppLoadContext) => {
  const xApiKey = ctx.cloudflare.env.API_TOKEN

  const cookieSessionStorage = createCookieSessionStorage({
    cookie: {
      name: '__session',
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secrets: [ctx.cloudflare.env.COOKIE_SESSION_SECRET],
      secure: false,
    },
  })

  const getSession = async () => {
    const cookie = request.headers.get('Cookie')
    return cookieSessionStorage.getSession(cookie)
  }

  const getAuthentication = async () => {
    const session = await getSession()
    const sessionData = getCookieSessionData(session)
    if (!sessionData) {
      return
    }
    if (!isSessionExpired(sessionData.accessToken)) {
      return {
        user: sessionData.user,
        accessToken: sessionData.accessToken,
        headers: new Headers(),
      }
    }

    const { user, headers, accessToken } = await renewSession(
      sessionData.refreshToken,
      sessionData.cookieExpires,
    )

    if (request.method === 'GET') {
      throw redirect(request.url, { headers })
    }

    return { user, accessToken, headers }
  }

  const destroySessionHeaders = async () => {
    const headers = new Headers()
    const session = await getSession()
    headers.append('Set-Cookie', await cookieSessionStorage.destroySession(session))
    return headers
  }

  const renewSession = async (refreshToken: string, cookieExpires: string) => {
    const { data, error } = await apiClient.POST('/auth/refresh-token', {
      body: {
        refreshToken,
      },
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': xApiKey,
      },
    })
    if (error) {
      const headers = await destroySessionHeaders()
      throw redirect('/login', { headers })
    }
    const user = getUserFromIdToken(data.idToken)
    const accessToken = data.accessToken
    const sessionData = CookieSessionDataSchema.parse({
      refreshToken,
      user,
      accessToken,
      cookieExpires,
    })

    const session = await getSession()
    setCookieSessionData(session, sessionData)
    const headers = new Headers()
    headers.append(
      'Set-Cookie',
      await cookieSessionStorage.commitSession(session, {
        expires: parseISO(cookieExpires),
      }),
    )
    return { headers, user, accessToken }
  }

  const loaderAuthenticate = async () => {
    const result = await getAuthentication()
    if (!result) {
      const headers = await destroySessionHeaders()
      throw redirect('/login', { headers })
    }
    return result
  }

  const createUserSession = async ({ tokens, redirectTo, rememberMe }: CreateUserSessionProps) => {
    const session = await getSession()
    const user = getUserFromIdToken(tokens.idToken)
    const now = new Date()
    const expires = rememberMe ? addMonths(now, 12) : addDays(now, 2)

    const sessionData = CookieSessionDataSchema.safeParse({
      refreshToken: tokens.refreshToken,
      user,
      accessToken: tokens.accessToken,
      cookieExpires: expires.toISOString(),
    })

    if (!sessionData.success) {
      throw new Error('Session data corrupted')
    }

    setCookieSessionData(session, sessionData.data)

    const headers = new Headers()
    headers.append(
      'Set-Cookie',
      await cookieSessionStorage.commitSession(session, {
        expires,
      }),
    )

    return redirect(redirectTo, {
      headers,
    })
  }

  return {
    loaderAuthenticate,
    createUserSession,
  }
}
