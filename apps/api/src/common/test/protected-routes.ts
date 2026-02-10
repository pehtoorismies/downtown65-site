import { env } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'
import app from '~/server'

interface RouteDefinition {
  method: string
  path: string
}

/**
 * Creates test suite for routes protected by API key middleware.
 * Tests both missing and invalid API key scenarios.
 */
export function describeApiKeyProtection(routes: RouteDefinition[]) {
  describe.each(routes)('API Key Only: $method $path', ({ method, path }) => {
    it('returns 401 without API key', async () => {
      const res = await app.request(path, { method }, env)
      expect(res.status).toBe(401)
      expect(await res.json()).toEqual({ error: 'Missing x-api-key header' })
    })

    it('returns 401 with incorrect API key', async () => {
      const headers = new Headers({
        'x-api-key': 'wrong-api-key',
      })
      const res = await app.request(path, { headers, method }, env)
      expect(res.status).toBe(401)
      expect(await res.json()).toEqual({ error: 'Invalid x-api-key key' })
    })
  })
}

/**
 * Creates test suite for routes protected by JWT middleware.
 * Tests both missing and invalid JWT scenarios.
 * Assumes routes also require API key authentication.
 */
export function describeJwtProtection(routes: RouteDefinition[]) {
  const testEnv = {
    ...env,
    API_KEY: 'test-api-key',
  }

  const headers = new Headers({
    'x-api-key': 'test-api-key',
  })

  describe.each(routes)('JWT Protected: $method $path', ({ method, path }) => {
    it('returns 401 without JWT', async () => {
      const res = await app.request(path, { headers, method }, testEnv)
      expect(res.status).toBe(401)
      expect(await res.text()).toEqual('Unauthorized')
    })

    it('returns 401 with invalid JWT', async () => {
      const res = await app.request(
        path,
        {
          headers: {
            ...Object.fromEntries(headers.entries()),
            Authorization: 'Bearer invalid-token',
          },
          method,
        },
        testEnv,
      )
      expect(res.status).toBe(401)
    })
  })
}
