import type { ISODateTime } from '@downtown65/schema'

type User = {
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

type ListedUsers = {
  length: number
  limit: number
  start: number
  total: number
  users: User[]
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

export interface SaasUserService {
  getByNickname: (nickname: string) => Promise<User | null>
  getBySub: (sub: string) => Promise<User | null>
  paginatedList: (page: number, limit: number) => Promise<ListedUsers>
  update: (sub: string, params: UpdateUserParams) => Promise<void>
}
