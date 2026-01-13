import { createLogger } from '@downtown65/logger'
import { stringToID } from '@downtown65/schema'
import { getApiClient } from '~/api/api-client'
import { AuthContext } from '~/context/context'
import { authMiddleware } from '~/middleware/auth-middleware'
import type { Route } from './+types/route'

export const middleware = [authMiddleware()]

export const action = async ({
  request,
  context,
  params,
}: Route.ActionArgs) => {
  const logger = createLogger({
    appContext: 'Event Participation Action',
  })
  const eventID = stringToID.decode(params.id)
  logger.withContext({ eventID, method: request.method })

  const authContext = context.get(AuthContext)
  if (!authContext) {
    logger.warn('Unauthorized access to event participation action')
    throw new Error('Unauthorized')
  }

  logger.withContext({
    eventID,
    method: request.method,
    user: authContext.user,
  })
  logger.info(`User ${authContext.user.nickname} is modifying participation.`)

  const { accessToken } = authContext

  const requestOptions = {
    params: {
      path: { id: stringToID.encode(eventID) },
    },
    headers: {
      'x-api-key': context.cloudflare.env.API_KEY,
      authorization: `Bearer ${accessToken}`,
    },
  }

  const apiClient = getApiClient(context.cloudflare.env.API_HOST)

  const { error } =
    request.method === 'POST'
      ? await apiClient.POST('/events/{id}/participants/me', requestOptions)
      : await apiClient.DELETE('/events/{id}/participants/me', requestOptions)

  if (error) {
    logger.withError(error).error('API request failed')
    return { success: false }
  }
  return { success: true }
}
