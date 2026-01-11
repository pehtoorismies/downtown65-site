import createClient from 'openapi-fetch'
import type { paths } from './+types/api.d'

export const getApiClient = (apiHost: string) => {
  return createClient<paths>({ baseUrl: apiHost })
}
