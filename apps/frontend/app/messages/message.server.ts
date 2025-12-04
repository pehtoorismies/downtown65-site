import type { Session } from 'react-router'
import { createCookieSessionStorage } from 'react-router'

export type ToastMessage = { message: string; type: 'success' | 'error' }

const { commitSession, getSession } = createCookieSessionStorage({
  cookie: {
    name: '__message',
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    // expires: new Date(Date.now() + ONE_YEAR),
    secrets: ['asdasdasdasdasdasdasdasdasdasdasd'], // TODO: Move to env
    secure: true,
  },
})

export const setMessage = (session: Session, message: ToastMessage) => {
  session.flash('toastMessage', message)
}

export { commitSession as commitMessageSession, getSession as getMessageSession }
