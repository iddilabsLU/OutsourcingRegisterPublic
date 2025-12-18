"use client"

import { useState } from "react"
import { Shield, Key, Loader2, Info, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/components/providers/auth-provider"
import { ChangeMasterDialog } from "./change-master-dialog"
import { toast } from "sonner"

export function AuthSettingsCard() {
  const { authSettings, isAdmin, refreshAuthSettings } = useAuth()
  const [isToggling, setIsToggling] = useState(false)
  const [showEnableConfirm, setShowEnableConfirm] = useState(false)
  const [showDisableConfirm, setShowDisableConfirm] = useState(false)
  const [showChangeMaster, setShowChangeMaster] = useState(false)

  const isElectron = typeof window !== "undefined" && window.electronAPI
  const authEnabled = authSettings?.authEnabled ?? false

  // Can toggle auth if: admin OR auth is currently disabled (anyone can enable)
  const canToggleAuth = isAdmin || !authEnabled

  const handleToggleClick = () => {
    if (authEnabled) {
      // Want to disable - show confirm dialog
      setShowDisableConfirm(true)
    } else {
      // Want to enable - show confirm dialog
      setShowEnableConfirm(true)
    }
  }

  const handleEnableAuth = async () => {
    if (!isElectron) return

    setIsToggling(true)
    try {
      await window.electronAPI.enableAuth()
      await refreshAuthSettings()
      toast.success("Authentication enabled", {
        description: "Default admin account created (admin/admin). Please change the password.",
      })
    } catch (error) {
      console.error("Failed to enable auth:", error)
      toast.error("Failed to enable authentication")
    } finally {
      setIsToggling(false)
      setShowEnableConfirm(false)
    }
  }

  const handleDisableAuth = async () => {
    if (!isElectron) return

    setIsToggling(true)
    try {
      await window.electronAPI.disableAuth()
      await refreshAuthSettings()
      toast.success("Authentication disabled", {
        description: "The app is now accessible without login.",
      })
    } catch (error) {
      console.error("Failed to disable auth:", error)
      toast.error("Failed to disable authentication")
    } finally {
      setIsToggling(false)
      setShowDisableConfirm(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Authentication</CardTitle>
          </div>
          <CardDescription>
            Control access to the application with user accounts and roles
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Auth toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="auth-toggle" className="text-base font-medium">
                Enable Authentication
              </Label>
              <p className="text-sm text-muted-foreground">
                {authEnabled
                  ? "Users must log in to access the app"
                  : "The app is accessible to everyone without login"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isToggling && <Loader2 className="h-4 w-4 animate-spin" />}
              <Switch
                id="auth-toggle"
                checked={authEnabled}
                onCheckedChange={handleToggleClick}
                disabled={isToggling || !canToggleAuth}
              />
            </div>
          </div>

          {/* Current status info */}
          <div className="rounded-md bg-muted/50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Current Status</span>
            </div>
            <div className="text-sm text-muted-foreground pl-6">
              {authEnabled ? (
                <ul className="space-y-1 list-disc list-inside">
                  <li>Login required to access the application</li>
                  <li>Three roles available: Administrator, Editor, Viewer</li>
                  <li>Only administrators can manage users and settings</li>
                </ul>
              ) : (
                <ul className="space-y-1 list-disc list-inside">
                  <li>No login required - full access for everyone</li>
                  <li>Enable authentication to restrict access</li>
                </ul>
              )}
            </div>
          </div>

          {/* Master password section - only when auth is enabled */}
          {authEnabled && isAdmin && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    <Label className="text-base font-medium">Master Password</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Recovery password for emergency access
                    {!authSettings?.masterPasswordSet && (
                      <span className="text-amber-600 ml-1">
                        (still using default - please change)
                      </span>
                    )}
                  </p>
                </div>
                <Button variant="outline" onClick={() => setShowChangeMaster(true)}>
                  Change
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enable confirmation dialog */}
      <AlertDialog open={showEnableConfirm} onOpenChange={setShowEnableConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enable Authentication?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>This will require all users to log in to access the application.</p>
                <div className="rounded-md bg-amber-50 border border-amber-200 p-3">
                  <div className="flex gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium">Default Admin Account</p>
                      <p className="mt-1">A default administrator account will be created:</p>
                      <ul className="mt-1 list-disc list-inside">
                        <li>
                          Username: <code className="bg-amber-100 px-1 rounded">admin</code>
                        </li>
                        <li>
                          Password: <code className="bg-amber-100 px-1 rounded">admin</code>
                        </li>
                      </ul>
                      <p className="mt-2 font-medium">
                        Please change this password immediately after enabling.{" "}
                      </p>
                      <p>
                        Forgot yourpassword? Use the master password &apos;master123&apos; to
                        recover access.{" "}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isToggling}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleEnableAuth} disabled={isToggling}>
              {isToggling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enabling...
                </>
              ) : (
                "Enable Authentication"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Disable confirmation dialog */}
      <AlertDialog open={showDisableConfirm} onOpenChange={setShowDisableConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable Authentication?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>This will allow anyone to access the application without logging in.</p>
                <div className="rounded-md bg-amber-50 border border-amber-200 p-3">
                  <div className="flex gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">
                      All existing user accounts will be preserved. You can re-enable authentication
                      at any time.
                    </p>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isToggling}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisableAuth}
              disabled={isToggling}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isToggling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Disabling...
                </>
              ) : (
                "Disable Authentication"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change master password dialog */}
      <ChangeMasterDialog open={showChangeMaster} onOpenChange={setShowChangeMaster} />
    </>
  )
}
