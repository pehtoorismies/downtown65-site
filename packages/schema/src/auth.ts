import { z } from 'zod'

// ============================================
// Auth Schemas
// ============================================

export const LoginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const RegisterSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  registerSecret: z.string().min(1, 'Register secret is required'),
})

export const ForgotPasswordSchema = z.object({
  email: z.email('Invalid email address'),
})

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
})

// ============================================
// Type Exports
// ============================================

export type Login = z.infer<typeof LoginSchema>
export type Register = z.infer<typeof RegisterSchema>
export type ForgotPassword = z.infer<typeof ForgotPasswordSchema>
export type RefreshToken = z.infer<typeof RefreshTokenSchema>
