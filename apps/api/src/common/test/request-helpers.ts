import type { ProvidedEnv } from 'cloudflare:test'
import type { AppAPI } from '~/app-api'
import type { HttpMethod } from './types'

export interface JWTPayload {
  sub?: string
  email?: string
  name?: string
  [key: string]: unknown
}

export interface RequestOptions {
  headers?: Record<string, string>
  body?: unknown
}

/**
 * Makes a request with custom options.
 */
export async function makeRequest(
  app: AppAPI,
  env: ProvidedEnv,
  path: string,
  options: RequestOptions & { method: HttpMethod },
): Promise<Response> {
  const headers: Record<string, string> = { ...options.headers }

  if (options.body) {
    headers['Content-Type'] = 'application/json'
  }

  return app.request(
    path,
    {
      body: options.body ? JSON.stringify(options.body) : undefined,
      headers,
      method: options.method,
    },
    env,
  )
}

/**
 * Makes an authenticated request with both API key and JWT token.
 * Note: This uses the mocked JWT middleware from jwk-mock.ts which accepts 'valid-token'.
 */
export function authenticatedRequest(
  app: AppAPI,
  env: ProvidedEnv,
  path: string,
  method: HttpMethod,
  body?: unknown,
): Promise<Response> {
  return makeRequest(app, env, path, {
    body,
    headers: {
      Authorization: 'Bearer valid-token',
      'x-api-key': env.API_KEY || 'test-api-key',
    },
    method,
  })
}

/**
 * Makes an unauthenticated request (no API key or JWT).
 */
export function unauthenticatedRequest(
  app: AppAPI,
  env: ProvidedEnv,
  path: string,
  method: HttpMethod,
  body?: unknown,
): Promise<Response> {
  return makeRequest(app, env, path, { body, method })
}
