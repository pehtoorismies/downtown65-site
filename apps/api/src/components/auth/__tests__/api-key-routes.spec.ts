import { describeApiKeyProtection } from '~/common/test/protected-routes'

const apiKeyProtectedRoutes = [
  { method: 'POST', path: '/auth/login' },
  { method: 'POST', path: '/auth/signup' },
  { method: 'POST', path: '/auth/forgot-password' },
  { method: 'POST', path: '/auth/refresh-token' },
]

describeApiKeyProtection(apiKeyProtectedRoutes)
