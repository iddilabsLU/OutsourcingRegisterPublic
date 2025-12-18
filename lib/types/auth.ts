/**
 * Authentication and RBAC types for the Supplier Outsourcing Register
 */

// User roles
export type UserRole = 'admin' | 'editor' | 'viewer'

// Role hierarchy for permission checks (higher = more access)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 3,
  editor: 2,
  viewer: 1,
}

// Permission actions that can be checked
export type PermissionAction =
  | 'view:suppliers'
  | 'edit:suppliers'
  | 'delete:suppliers'
  | 'view:reporting'
  | 'edit:issues'
  | 'manage:users'
  | 'manage:auth'

// Permission matrix - which roles have which permissions
export const ROLE_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  admin: [
    'view:suppliers',
    'edit:suppliers',
    'delete:suppliers',
    'view:reporting',
    'edit:issues',
    'manage:users',
    'manage:auth',
  ],
  editor: [
    'view:suppliers',
    'edit:suppliers',
    'delete:suppliers',
    'view:reporting',
    'edit:issues',
  ],
  viewer: [
    'view:suppliers',
    'view:reporting',
  ],
}

/**
 * User entity from database
 */
export interface User {
  id: number
  username: string
  displayName: string
  role: UserRole
  isSystemUser: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Input for creating a new user
 */
export interface CreateUserInput {
  username: string
  password: string
  displayName: string
  role: UserRole
}

/**
 * Input for updating an existing user
 */
export interface UpdateUserInput {
  displayName?: string
  password?: string
  role?: UserRole
}

/**
 * Authentication settings from database
 */
export interface AuthSettings {
  authEnabled: boolean
  masterPasswordSet: boolean // True if changed from default "master123"
}

/**
 * Current auth session
 */
export interface AuthSession {
  user: User
  loginTime: string
  rememberMe: boolean
  isMasterOverride?: boolean // True if logged in via master password
}

/**
 * Result of a login attempt
 */
export interface LoginResult {
  success: boolean
  user?: User
  error?: string
  isMasterOverride?: boolean
}

/**
 * Result of checking if a user can be deleted
 */
export interface CanDeleteUserResult {
  canDelete: boolean
  reason?: string
}

/**
 * Helper function to check if a role has a specific permission
 */
export function hasPermission(role: UserRole | undefined, action: PermissionAction): boolean {
  if (!role) return false
  return ROLE_PERMISSIONS[role]?.includes(action) ?? false
}

/**
 * Helper function to check if a role is admin
 */
export function isAdmin(role: UserRole | undefined): boolean {
  return role === 'admin'
}

/**
 * Helper function to check if a role is at least editor level
 */
export function isEditorOrAbove(role: UserRole | undefined): boolean {
  if (!role) return false
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY.editor
}

/**
 * Display labels for roles
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  editor: 'Editor',
  viewer: 'Viewer',
}

/**
 * Role descriptions for UI
 */
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: 'Full access including user management and authentication settings',
  editor: 'Can edit suppliers and issues, but cannot manage users or settings',
  viewer: 'Read-only access to all data',
}
