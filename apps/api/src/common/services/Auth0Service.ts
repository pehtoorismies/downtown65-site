import { Auth0SubSchema, ISODateTimeSchema } from '@downtown65/schema'
import { AuthenticationClient, ManagementClient } from 'auth0'
import { z } from 'zod'
import type { AuthConfig } from '~/common/config/config'
import type { SaasUserService } from './SaasUserService'

const Auth0UserSchema = z
  .object({
    app_metadata: z.object({
      role: z.string(),
    }),
    created_at: ISODateTimeSchema,
    email: z.email(),
    name: z.string(),
    nickname: z.string(),
    picture: z.httpUrl(),
    updated_at: ISODateTimeSchema,
    user_id: z.string(),
    user_metadata: z.object({
      subscribeEventCreationEmail: z.boolean(),
      subscribeWeeklyEmail: z.boolean(),
    }),
  })
  .transform((user) => ({
    createdAt: user.created_at,
    email: user.email,
    name: user.name,
    nickname: user.nickname,
    picture: user.picture,
    sub: Auth0SubSchema.parse(user.user_id),
    subscriptions: {
      eventCreationEmail: user.user_metadata.subscribeEventCreationEmail,
      weeklyEmail: user.user_metadata.subscribeWeeklyEmail,
    },
    updatedAt: user.updated_at,
  }))

const Auth0UserListResponseSchema = z.object({
  length: z.number(),
  limit: z.number(),
  start: z.number(),
  total: z.number(),
  users: z.array(Auth0UserSchema),
})

const QUERY_USER_RETURNED_FIELDS = [
  'nickname',
  'name',
  'user_id',
  'picture',
  'email',
  'created_at',
  'updated_at',
  'app_metadata',
  'user_metadata',
].join(',')

const isNotFoundError = (error: unknown): boolean => {
  return (
    error instanceof Error &&
    'statusCode' in error &&
    (error as { statusCode: number }).statusCode === 404
  )
}

export const createAuth0UserService = (
  authConfig: AuthConfig,
): SaasUserService => {
  const getManagementClient = async () => {
    const authClient = new AuthenticationClient(authConfig)
    const tokenResult = await authClient.oauth.clientCredentialsGrant({
      audience: `https://${authConfig.domain}/api/v2/`,
    })

    return new ManagementClient({
      domain: authConfig.domain,
      token: tokenResult.data.access_token,
    })
  }

  return {
    getByNickname: async (nickname) => {
      const management = await getManagementClient()
      const { data } = await management.users.list({
        fields: QUERY_USER_RETURNED_FIELDS,
        q: `nickname:${nickname}`,
        sort: 'created_at:1',
      })

      if (data.length === 0) {
        return null
      }

      if (data.length > 1) {
        throw new Error('Multiple users found with the same nickname')
      }

      return Auth0UserSchema.parse(data[0])
    },

    getBySub: async (sub) => {
      const management = await getManagementClient()
      try {
        const user = await management.users.get(sub, {
          fields: QUERY_USER_RETURNED_FIELDS,
        })
        return Auth0UserSchema.parse(user)
      } catch (error) {
        if (isNotFoundError(error)) {
          return null
        }
        throw error
      }
    },

    paginatedList: async (page, limit) => {
      const management = await getManagementClient()
      const adjustedPage = page > 0 ? page - 1 : 0
      const adjustedLimit = limit > 0 ? limit : 1

      const { response } = await management.users.list({
        fields: QUERY_USER_RETURNED_FIELDS,
        include_totals: true,
        page: adjustedPage,
        per_page: adjustedLimit,
        sort: 'created_at:1',
      })

      return Auth0UserListResponseSchema.parse(response)
    },

    update: async (sub, params) => {
      const management = await getManagementClient()

      const auth0Params: Record<string, unknown> = {}

      if (params.nickname !== undefined) {
        auth0Params.nickname = params.nickname
      }
      if (params.name !== undefined) {
        auth0Params.name = params.name
      }
      if (params.picture !== undefined) {
        auth0Params.picture = params.picture
      }

      if (
        params.subscriptions.eventCreationEmail !== undefined ||
        params.subscriptions.weeklyEmail !== undefined
      ) {
        auth0Params.user_metadata = {
          subscribeEventCreationEmail: params.subscriptions.eventCreationEmail,
          subscribeWeeklyEmail: params.subscriptions.weeklyEmail,
        }
      }

      await management.users.update(sub, auth0Params)
    },
  }
}
