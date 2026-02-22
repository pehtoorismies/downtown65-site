import type { ISODateTime } from '@downtown65/schema'

export type SaasUser = {
  sub: string
  nickname: string
  name: string
  email: string
  picture: string
  createdAt: ISODateTime
  updatedAt: ISODateTime
  subscriptions: {
    eventCreationEmail: boolean
    weeklyEmail: boolean
  }
}

type ListedSaasUsers = {
  length: number
  limit: number
  start: number
  total: number
  users: SaasUser[]
}

type UpdateUserParams = {
  nickname?: string
  name?: string
  picture?: string
  subscriptions: {
    eventCreationEmail?: boolean
    weeklyEmail?: boolean
  }
}

type CreateUserParams = {
  nickname: string
  name: string
  email: string
  password: string
  role: 'USER' | 'ADMIN'
}

type CreateUserError = {
  type: 'Error'
  error: string
  statusCode: number
}

type CreateUserSuccess = {
  type: 'Success'
  user: SaasUser
}

type CreateUserResult = CreateUserError | CreateUserSuccess

export interface SaasUserService {
  getBySub: (sub: string) => Promise<SaasUser | null>
  getByNickname: (nickname: string) => Promise<SaasUser | null>
  paginatedList: (page: number, limit: number) => Promise<ListedSaasUsers>
  update: (sub: string, params: UpdateUserParams) => Promise<void>
  createUser: (params: CreateUserParams) => Promise<CreateUserResult>
}
