export * from './user'
export * from './activity'
export * from './participant'
export * from './conflict'
export * from './document'
export * from './notification'

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
