import { createLogger } from '@downtown65/logger'
import { apiClient } from '~/api/api-client'
import { AuthContext } from '~/context/context'
import type { Route } from './+types/route'

const getApiRequest = (method: 'POST' | 'DELETE') => {
  if (method === 'POST') {
    return apiClient.POST
  } else {
    return apiClient.DELETE
  }
}
export const action = async ({
  request,
  context,
  params,
}: Route.ActionArgs) => {
  const logger = createLogger({
    appContext: 'Frontend: Event Participation POST or DELETE',
  })
  const id = +params.id

  if (Number.isNaN(id)) {
    throw new Error('Event ID must be a number')
  }
  const authContext = context.get(AuthContext)
  if (!authContext) {
    throw new Error('Unauthorized')
  }
  if (request.method !== 'POST' && request.method !== 'DELETE') {
    throw new Error(`Unsupported request method ${request.method}`)
  }

  const client = getApiRequest(request.method)

  const { accessToken } = authContext

  const { error } = await client('/events/{id}/participants/me', {
    params: {
      path: { id },
    },
    headers: {
      'x-api-key': context.cloudflare.env.API_KEY,
      authorization: `Bearer ${accessToken}`,
    },
  })

  if (error) {
    logger.withError(error).error('API request failed')
    return { success: false }
  }
  return { success: true }
}
