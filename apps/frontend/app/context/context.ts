import type { User } from '@downtown65/schema'
import { createContext } from 'react-router'

interface AuthContextType {
  user: User
  accessToken: string
}

export const AuthContext = createContext<AuthContextType | null>(null)
