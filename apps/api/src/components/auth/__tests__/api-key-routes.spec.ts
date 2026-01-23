import { env } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'
import app from '~/server'

const headers = new Headers({
  'x-api-key': 'test-api-key',
})

const apiKeyProtectedRoutes = [
  { method: 'POST', path: '/auth/login' },
  { method: 'POST', path: '/auth/signup' },
  { method: 'POST', path: '/auth/forgot-password' },
  { method: 'POST', path: '/auth/refresh-token' },
]

describe.each(apiKeyProtectedRoutes)('API Key Only: $method $path', async ({
  method,
  path,
}) => {
  it('returns 401 without API key', async () => {
    const res = await app.request(path, { method }, env)
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: 'Missing x-api-key header' })
  })

  it('returns 401 without correct API key', async () => {
    const res = await app.request(path, { method, headers }, env)
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: 'Invalid x-api-key key' })
  })
})
