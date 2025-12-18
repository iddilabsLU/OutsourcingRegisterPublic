"use client"

import { useAuth } from "@/components/providers/auth-provider"
import { AuthSettingsCard } from "./auth-settings-card"
import { UserManagement } from "./user-management"
import { AlertTriangle } from "lucide-react"

export function SettingsView() {
  const { isAdmin, isMasterOverride, authSettings } = useAuth()

  return (
    <div className="space-y-6">
      {/* Master override warning */}
      {isMasterOverride && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-amber-800">
                Logged in with Master Override
              </p>
              <p className="text-sm text-amber-700">
                You have temporary administrator access via the master password.
                Consider creating or recovering a regular admin account.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {/* Authentication Settings - always visible */}
        <AuthSettingsCard />

        {/* User Management - only visible when auth is enabled and user is admin */}
        {authSettings?.authEnabled && isAdmin && <UserManagement />}
      </div>
    </div>
  )
}
