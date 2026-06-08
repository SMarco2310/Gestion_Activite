export type UserRole = 'chef_departement' | 'admin'

export interface User {
  id: string
  fullName: string
  email: string
  department: string
  role: UserRole
  emailVerified: boolean
  createdAt: string
}

export interface AuthUser extends User {
  token: string
}
