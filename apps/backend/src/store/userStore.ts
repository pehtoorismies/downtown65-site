import type { User, UserUpdateInput } from '../schemas/user'

export class UserStore {
  private users = new Map<string, User>()

  list(): User[] {
    return Array.from(this.users.values())
  }

  get(id: string): User | undefined {
    return this.users.get(id)
  }

  create(user: User): User {
    this.users.set(user.id, user)
    return user
  }

  update(id: string, patch: UserUpdateInput): User | undefined {
    const existing = this.users.get(id)
    if (!existing) {
      return undefined
    }
    const updated: User = { ...existing, ...patch }
    this.users.set(id, updated)
    return updated
  }

  delete(id: string): boolean {
    return this.users.delete(id)
  }

  clear(): void {
    this.users.clear()
  }
}
