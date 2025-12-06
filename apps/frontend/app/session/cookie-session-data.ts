import type { Session } from 'react-router'
import { z } from 'zod'
import { UserSchema } from '~/domain/user'

const CookieSessionBase = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  cookieExpires: z.string().datetime(),
  user: UserSchema,
})

export const CookieSessionDataSchema = CookieSessionBase.extend({})

const CookieSessionStoredDataSchema = CookieSessionBase.extend({
  userJSON: z.string(),
})

// type CookieSessionStoredData = z.infer<typeof CookieSessionStoredDataSchema>
type CookieSessionData = z.infer<typeof CookieSessionDataSchema>

// export const getCookieSessionData = (
//   session: Session<CookieSessionStoredData>,
// ): CookieSessionData | undefined => {
//   const userJSON = session.get('userJSON')
//   const accessToken = session.get('accessToken')
//   const refreshToken = session.get('refreshToken')
//   const cookieExpires = session.get('cookieExpires')
//   const sessionData = CookieSessionDataSchema.safeParse({
//     user: userJSON == null ? undefined : JSON.parse(userJSON),
//     accessToken,
//     refreshToken,
//     cookieExpires,
//   })

//   if (sessionData.success) {
//     return sessionData.data
//   }
// }

// export const setCookieSessionData = (
//   session: Session<CookieSessionStoredData>,
//   { refreshToken, user, accessToken, cookieExpires }: CookieSessionData,
// ) => {
//   session.set('refreshToken', refreshToken)
//   session.set('userJSON', JSON.stringify(user))
//   session.set('accessToken', accessToken)
//   session.set('cookieExpires', cookieExpires)
// }
