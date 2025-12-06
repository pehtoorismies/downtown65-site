import { addDays, addMonths, isAfter, parseISO } from 'date-fns'
import { jwtDecode } from 'jwt-decode'
import { createCookieSessionStorage, redirect } from 'react-router'
import type { RouterContextProvider, Session } from 'react-router'
import { z } from 'zod'
import { apiClient } from '~/api/api-client'
import { type User, UserSchema } from '~/domain/user'

const AccessTokenPartialSchema = z.object({
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
  rememberMe: boolean
  request: Request
}

const getUserFromIdToken = (idTokenJWT: string): User => {
  const decoded = jwtDecode(idTokenJWT)
  return UserSchema.parse({
    ...decoded,
    id: decoded.sub,
  })
}

const isAccessTokenExpired = (accessToken: string): boolean => {
  const decoded = jwtDecode(accessToken)
  const { exp } = AccessTokenPartialSchema.parse(decoded)
  // exp is in seconds since Unix epoch
  const expirationDate = new Date(exp * 1000)
  return isAfter(new Date(), expirationDate)
}

const isSessionCookieExpired = (expiresAt: string) => isAfter(new Date(), parseISO(expiresAt))

interface Secrets {
  COOKIE_SESSION_SECRET: string
  API_KEY: string
}

const CookieSessionDataSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresAt: z.iso.datetime(),
  user: UserSchema,
})
type CookieSessionData = z.infer<typeof CookieSessionDataSchema>

type FlashData = {
  error?: string
  success?: string
}

const getCookieSessionStorage = (cookieSessionSecret: string) => {
  return createCookieSessionStorage<CookieSessionData, FlashData>({
    cookie: {
      name: '__session',
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      // secrets: [cookieSessionSecret],
      secure: false, // set to true in production
      maxAge: 60 * 60 * 24 * 365, // 1 year
    },
  })
}

type UserSessionResponse =
  | {
      success: true
      user: User
      accessToken: string
      headers: Headers
    }
  | {
      success: false
      message: string
      headers: Headers
    }

export const createSessionManager = (secrets: Secrets) => {
  const { getSession, destroySession, commitSession } = getCookieSessionStorage(
    secrets.COOKIE_SESSION_SECRET,
  )

  const getErrorResponse = async (
    session: Session<CookieSessionData, FlashData>,
    message: string,
  ) => {
    const headers = new Headers()
    headers.append('Set-Cookie', await destroySession(session))
    return {
      success: false as const,
      message,
      headers,
    }
  }
  const getUserSession = async (request: Request): Promise<UserSessionResponse> => {
    const session = await getSession(request.headers.get('Cookie'))
    const sessionData = CookieSessionDataSchema.safeParse(session.data)

    if (!sessionData.success) {
      return getErrorResponse(session, 'Invalid session data')
    }

    if (isSessionCookieExpired(sessionData.data.expiresAt)) {
      return getErrorResponse(session, 'Cookie session expired')
    }
    const accessTokenExpired = isAccessTokenExpired(sessionData.data.accessToken)

    if (!accessTokenExpired) {
      return {
        success: true,
        user: sessionData.data.user,
        accessToken: sessionData.data.accessToken,
        headers: new Headers(),
      }
    }

    const { data: renewedData, error } = await apiClient.POST('/auth/refresh-token', {
      body: {
        refreshToken: sessionData.data.refreshToken,
      },
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': secrets.API_KEY,
      },
    })

    if (error) {
      return getErrorResponse(session, 'Failed to refresh access token')
    }

    session.set('accessToken', renewedData.accessToken)

    const headers = new Headers()
    headers.append('Set-Cookie', await commitSession(session))

    return {
      success: true,
      user: sessionData.data.user,
      accessToken: renewedData.accessToken,
      headers,
    }
  }

  const createUserSession = async ({ request, tokens, rememberMe }: CreateUserSessionProps) => {
    const session = await getSession(request.headers.get('Cookie'))
    const user = getUserFromIdToken(tokens.idToken)
    const now = new Date()
    const expiresAt = rememberMe ? addMonths(now, 12) : addDays(now, 2)

    const authResponse = CookieSessionDataSchema.safeParse({
      refreshToken: tokens.refreshToken,
      user,
      accessToken: tokens.accessToken,
      expiresAt: expiresAt.toISOString(),
    })
    if (!authResponse.success) {
      console.error(authResponse.error)
      throw new Error('Session data is malformed')
    }

    session.set('refreshToken', authResponse.data.refreshToken)
    session.set('accessToken', authResponse.data.accessToken)
    session.set('expiresAt', authResponse.data.expiresAt)
    session.set('user', authResponse.data.user)

    return session
  }

  return {
    getUserSession,
    createUserSession,
    commitSession,
  }
}
