import { LoginInput, SignupInput } from './schemas'

// User type based on actual database fields
export interface User {
  _id: string
  email: string
  password?: string // Optional since we don't want to expose it in frontend
  name: string
  timestamp: string
  approved: boolean
  admin: boolean
}

// Auth context type
export interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  logout: () => Promise<void>
  refetchUser: () => void
  isLoggingOut: boolean
}

// API response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Login response type
export interface LoginResponse {
  success: boolean
  token?: string
  user?: User
  approved?: boolean
  error?: string
}

// Re-export types from schemas
export type { LoginInput, SignupInput } 