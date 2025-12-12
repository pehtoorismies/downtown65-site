import { createContext } from 'react-router'
import type { User } from '~/domain/user'

interface AuthContextType {
  user: User
  accessToken: string
}

export const AuthContext = createContext<AuthContextType | null>(null)
