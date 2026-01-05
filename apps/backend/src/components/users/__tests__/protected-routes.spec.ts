import { env } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'
import app from '~/server'

const headers = new Headers({
  'x-api-key': 'test-api-key',
})

const apiKeyProtectedRoutes = [
  { method: 'GET', path: '/users' },
  { method: 'GET', path: '/users/me' },
  { method: 'GET', path: '/users/ada-lovelace' },
  { method: 'PUT', path: '/users/me' },
]

const jwtProtectedRoutes = [
  { method: 'GET', path: '/users' },
  { method: 'GET', path: '/users/me' },
  { method: 'GET', path: '/users/ada-lovelace' },
  { method: 'PUT', path: '/users/me' },
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

describe.each(jwtProtectedRoutes)('JWT Protected: $method $path', ({
  method,
  path,
}) => {
  const testEnv = {
    ...env,
    API_KEY: 'test-api-key',
  }

  it('returns 401 without JWT', async () => {
    const res = await app.request(path, { method, headers }, testEnv)
    expect(res.status).toBe(401)
    expect(await res.text()).toEqual('Unauthorized')
  })

  it('returns 401 with invalid JWT', async () => {
    const res = await app.request(
      path,
      {
        method,
        headers: {
          ...headers,
          Authorization: 'Bearer invalid-token',
        },
      },
      env,
    )
    expect(res.status).toBe(401)
  })
})
