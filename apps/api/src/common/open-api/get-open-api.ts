import app from '~/server'

// Mock environment for OpenAPI generation
// The /doc endpoint doesn't use these values, but the config validation middleware requires them
const mockEnv: Env = {
  API_KEY: 'mock-api-key',
  AUTH_AUDIENCE: 'https://graphql-dev.downtown65.com',
  AUTH_CLIENT_ID: 'JaoAht7ggce7f5R8DCBGUyjUJeMQEDtz',
  AUTH_CLIENT_SECRET: 'mock-client-secret',
  AUTH_DOMAIN: 'dev-dt65.eu.auth0.com',
  D1_DB: {} as D1Database, // Stub object to pass validation
  LOG_LEVEL: 'debug',
  REGISTER_SECRET: 'mock-register-secret',
}

export const getOpenAPISpec = async () => {
  const res = await app.request('/doc', { method: 'GET' }, mockEnv)
  const openapi = await res.json()
  return openapi
}
