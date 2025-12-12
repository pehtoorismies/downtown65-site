import createClient from 'openapi-fetch'
import type { paths } from './+types/api.d'

const apiUrl = import.meta.env.DEV
  ? 'http://localhost:3002'
  : 'https://api.downtown65.site'

export const apiClient = createClient<paths>({ baseUrl: apiUrl })
