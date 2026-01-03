import { createLogger } from '@downtown65/logger'
import { stringToID } from '@downtown65/schema'
import { apiClient } from '~/api/api-client'
import { AuthContext } from '~/context/context'
import { authMiddleware } from '~/middleware/auth-middleware'
import type { Route } from './+types/route'

const getApiRequest = (method: string) => {
  if (method === 'POST') {
    return apiClient.POST
  } else if (method === 'DELETE') {
    return apiClient.DELETE
  }
  throw new Error(`Unsupported request method ${method}`)
}

export const middleware = [authMiddleware()]

export const action = async ({
  request,
  context,
  params,
}: Route.ActionArgs) => {
  const logger = createLogger({
    appContext: 'Frontend: Event Participation POST or DELETE',
  })
  logger.debug(`Event participation action invoked. Method=${request.method}`)
  const eventID = stringToID.decode(params.id)

  const authContext = context.get(AuthContext)
  if (!authContext) {
    throw new Error('Unauthorized')
  }

  const client = getApiRequest(request.method)

  const { accessToken } = authContext

  const { error } = await client('/events/{id}/participants/me', {
    params: {
      path: { id: stringToID.encode(eventID) },
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
