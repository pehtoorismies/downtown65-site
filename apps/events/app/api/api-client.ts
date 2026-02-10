import createClient from 'openapi-fetch'
import type { paths } from './+types/api.d'

export const getApiClient = (apiHost: string) => {
  const protocol = apiHost.includes('localhost') ? 'http' : 'https'
  return createClient<paths>({ baseUrl: `${protocol}://${apiHost}` })
}
