"use client"

import * as React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type {
  User,
  AuthSettings,
  LoginResult,
  PermissionAction,
  UserRole,
} from "@/lib/types/auth"
import { ROLE_PERMISSIONS } from "@/lib/types/auth"

// Storage key for persisted session
const SESSION_STORAGE_KEY = "auth_session"

/**
 * Stored session data structure
 */
interface StoredSession {
  user: User
  loginTime: string
  isMasterOverride?: boolean
}

/**
 * Auth context value interface
 */
interface AuthContextValue {
  // State
  isLoading: boolean
  authSettings: AuthSettings | null
  currentUser: User | null
  isAuthenticated: boolean
  isMasterOverride: boolean

  // Actions
  login: (username: string, password: string, rememberMe?: boolean) => Promise<LoginResult>
  loginWithMaster: (password: string) => Promise<LoginResult>
  logout: () => void
  refreshAuthSettings: () => Promise<void>

  // Permission helpers
  hasPermission: (action: PermissionAction) => boolean
  isAdmin: boolean
  isEditor: boolean
  isViewer: boolean
  canEdit: boolean
}

// Create context with undefined default (must be used within provider)
const AuthContext = createContext<AuthContextValue | undefined>(undefined)

/**
 * Hook to use auth context
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

/**
 * Auth Provider component
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [authSettings, setAuthSettings] = useState<AuthSettings | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isMasterOverride, setIsMasterOverride] = useState(false)

  /**
   * Check if running in Electron environment
   */
  const isElectron = typeof window !== "undefined" && window.electronAPI

  /**
   * Load auth settings from database
   */
  const refreshAuthSettings = useCallback(async () => {
    if (!isElectron) {
      // Not in Electron - set default settings (auth disabled)
      setAuthSettings({ authEnabled: false, masterPasswordSet: false })
      return
    }

    try {
      const settings = await window.electronAPI.getAuthSettings()
      setAuthSettings(settings)
    } catch (error) {
      console.error("Failed to load auth settings:", error)
      // Default to auth disabled on error
      setAuthSettings({ authEnabled: false, masterPasswordSet: false })
    }
  }, [isElectron])

  /**
   * Try to restore session from localStorage
   */
  const restoreSession = useCallback(() => {
    if (typeof window === "undefined") return null

    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY)
      if (stored) {
        const session: StoredSession = JSON.parse(stored)
        return session
      }
    } catch (error) {
      console.error("Failed to restore session:", error)
      localStorage.removeItem(SESSION_STORAGE_KEY)
    }
    return null
  }, [])

  /**
   * Save session to localStorage for "remember me"
   */
  const saveSession = useCallback((user: User, isMaster: boolean) => {
    if (typeof window === "undefined") return

    const session: StoredSession = {
      user,
      loginTime: new Date().toISOString(),
      isMasterOverride: isMaster,
    }
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  }, [])

  /**
   * Clear saved session
   */
  const clearSession = useCallback(() => {
    if (typeof window === "undefined") return
    localStorage.removeItem(SESSION_STORAGE_KEY)
  }, [])

  /**
   * Login with username/password
   */
  const login = useCallback(
    async (username: string, password: string, rememberMe = false): Promise<LoginResult> => {
      if (!isElectron) {
        return { success: false, error: "Not running in Electron" }
      }

      try {
        const result = await window.electronAPI.login(username, password)

        if (result.success && result.user) {
          setCurrentUser(result.user)
          setIsMasterOverride(false)

          if (rememberMe) {
            saveSession(result.user, false)
          }
        }

        return result
      } catch (error) {
        console.error("Login error:", error)
        return { success: false, error: "Login failed" }
      }
    },
    [isElectron, saveSession]
  )

  /**
   * Login with master password
   */
  const loginWithMaster = useCallback(
    async (password: string): Promise<LoginResult> => {
      if (!isElectron) {
        return { success: false, error: "Not running in Electron" }
      }

      try {
        const result = await window.electronAPI.loginWithMaster(password)

        if (result.success && result.user) {
          setCurrentUser(result.user)
          setIsMasterOverride(true)
          // Don't persist master override sessions
          clearSession()
        }

        return result
      } catch (error) {
        console.error("Master login error:", error)
        return { success: false, error: "Master login failed" }
      }
    },
    [isElectron, clearSession]
  )

  /**
   * Logout
   */
  const logout = useCallback(() => {
    setCurrentUser(null)
    setIsMasterOverride(false)
    clearSession()
  }, [clearSession])

  /**
   * Check if user has a specific permission
   */
  const hasPermission = useCallback(
    (action: PermissionAction): boolean => {
      // If auth is disabled, everyone has all permissions
      if (!authSettings?.authEnabled) {
        return true
      }

      // If not logged in, no permissions
      if (!currentUser) {
        return false
      }

      // Check role permissions
      const rolePermissions = ROLE_PERMISSIONS[currentUser.role]
      return rolePermissions?.includes(action) ?? false
    },
    [authSettings, currentUser]
  )

  // Derived state
  const isAuthenticated = currentUser !== null
  const userRole = currentUser?.role as UserRole | undefined
  const isAdmin = userRole === "admin"
  const isEditor = userRole === "editor" || userRole === "admin"
  const isViewer = userRole === "viewer"
  const canEdit = authSettings?.authEnabled ? isEditor : true

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true)

      // Load auth settings
      await refreshAuthSettings()

      // Try to restore saved session
      const savedSession = restoreSession()
      if (savedSession) {
        setCurrentUser(savedSession.user)
        setIsMasterOverride(savedSession.isMasterOverride ?? false)
      }

      setIsLoading(false)
    }

    initialize()
  }, [refreshAuthSettings, restoreSession])

  // Context value
  const value: AuthContextValue = {
    isLoading,
    authSettings,
    currentUser,
    isAuthenticated,
    isMasterOverride,
    login,
    loginWithMaster,
    logout,
    refreshAuthSettings,
    hasPermission,
    isAdmin,
    isEditor,
    isViewer,
    canEdit,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
