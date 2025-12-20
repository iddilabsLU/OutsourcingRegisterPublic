"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Database,
  FolderOpen,
  RotateCcw,
  Loader2,
  AlertTriangle,
  Info,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
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
import { toast } from "sonner"

interface DatabasePathInfo {
  currentPath: string
  isCustom: boolean
  defaultPath: string
}

interface ValidatePathResult {
  valid: boolean
  error?: string
  exists: boolean
}

interface DatabaseSettingsCardProps {
  /** Whether the current user is an admin (can copy data) */
  isAdmin?: boolean
}

export function DatabaseSettingsCard({ isAdmin = false }: DatabaseSettingsCardProps) {
  const [pathInfo, setPathInfo] = useState<DatabasePathInfo | null>(null)
  const [newPath, setNewPath] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<ValidatePathResult | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [copyData, setCopyData] = useState(true)
  const [isResetting, setIsResetting] = useState(false)

  const isElectron = typeof window !== "undefined" && window.electronAPI

  // Load current path info on mount
  const loadPathInfo = useCallback(async () => {
    if (!isElectron) return

    setIsLoading(true)
    try {
      const info = await window.electronAPI.getDatabasePathInfo()
      setPathInfo(info)
      setNewPath(info.currentPath)
    } catch (error) {
      console.error("Failed to get database path info:", error)
      toast.error("Failed to load database settings")
    } finally {
      setIsLoading(false)
    }
  }, [isElectron])

  useEffect(() => {
    loadPathInfo()
  }, [loadPathInfo])

  // Validate path when it changes
  useEffect(() => {
    if (!isElectron || !newPath || newPath === pathInfo?.currentPath) {
      setValidationResult(null)
      return
    }

    const timeoutId = setTimeout(async () => {
      setIsValidating(true)
      try {
        const result = await window.electronAPI.validateDatabasePath(newPath)
        setValidationResult(result)
      } catch (error) {
        console.error("Failed to validate path:", error)
        setValidationResult({
          valid: false,
          error: "Failed to validate path",
          exists: false,
        })
      } finally {
        setIsValidating(false)
      }
    }, 500) // Debounce validation

    return () => clearTimeout(timeoutId)
  }, [newPath, pathInfo?.currentPath, isElectron])

  const handleBrowse = async () => {
    if (!isElectron) return

    try {
      const selectedPath = await window.electronAPI.showDatabaseFolderDialog()
      if (selectedPath) {
        setNewPath(selectedPath)
      }
    } catch (error) {
      console.error("Failed to open folder dialog:", error)
      toast.error("Failed to open folder picker")
    }
  }

  const handleApply = () => {
    if (!validationResult?.valid) return
    setShowConfirmDialog(true)
  }

  const handleConfirmApply = async () => {
    if (!isElectron) return

    setShowConfirmDialog(false)
    setIsApplying(true)

    // Only admins can copy data, and only when destination doesn't have existing db
    const shouldCopyData = isAdmin && copyData && !validationResult?.exists

    try {
      const result = await window.electronAPI.setDatabasePath(newPath, shouldCopyData)

      if (result.success) {
        toast.success("Database path updated", {
          description: "The application will restart now...",
        })

        // Wait a moment before restarting
        setTimeout(async () => {
          await window.electronAPI.restartApp()
        }, 1500)
      } else {
        toast.error("Failed to update database path", {
          description: result.error,
        })
        setIsApplying(false)
      }
    } catch (error) {
      console.error("Failed to set database path:", error)
      toast.error("Failed to update database path", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
      setIsApplying(false)
    }
  }

  const handleReset = async () => {
    if (!isElectron || !pathInfo) return

    setIsResetting(true)
    try {
      const result = await window.electronAPI.setDatabasePath(null, false)

      if (result.success) {
        toast.success("Database path reset to default", {
          description: "The application will restart now...",
        })

        setTimeout(async () => {
          await window.electronAPI.restartApp()
        }, 1500)
      } else {
        toast.error("Failed to reset database path", {
          description: result.error,
        })
        setIsResetting(false)
      }
    } catch (error) {
      console.error("Failed to reset database path:", error)
      toast.error("Failed to reset database path")
      setIsResetting(false)
    }
  }

  const hasPathChanged = newPath !== pathInfo?.currentPath
  const canApply = hasPathChanged && validationResult?.valid && !isValidating

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle>Database Location</CardTitle>
          </div>
          <CardDescription>Configure where your data is stored</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle>Database Location</CardTitle>
          </div>
          <CardDescription>
            Configure where your data is stored. Use a network path for multi-user
            access.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Current Path Display */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Current Location</Label>
              <Badge variant={pathInfo?.isCustom ? "default" : "secondary"}>
                {pathInfo?.isCustom ? "Custom" : "Default"}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Input
                value={pathInfo?.currentPath || ""}
                readOnly
                className="font-mono text-sm bg-muted"
              />
            </div>
          </div>

          <div className="border-t" />

          {/* Change Path Section */}
          <div className="space-y-3">
            <Label>New Location</Label>
            <div className="flex gap-2">
              <Input
                value={newPath}
                onChange={(e) => setNewPath(e.target.value)}
                placeholder="Enter path or browse..."
                className="font-mono text-sm"
                disabled={isApplying || isResetting}
              />
              <Button
                variant="outline"
                onClick={handleBrowse}
                disabled={isApplying || isResetting}
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Browse
              </Button>
            </div>

            {/* Validation Status */}
            {hasPathChanged && (
              <div className="flex items-center gap-2 text-sm">
                {isValidating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-muted-foreground">Validating path...</span>
                  </>
                ) : validationResult?.valid ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">
                      Path is valid
                      {validationResult.exists && " (existing database found)"}
                    </span>
                  </>
                ) : validationResult?.error ? (
                  <>
                    <XCircle className="h-4 w-4 text-destructive" />
                    <span className="text-destructive">{validationResult.error}</span>
                  </>
                ) : null}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleApply}
                disabled={!canApply || isApplying || isResetting}
              >
                {isApplying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Apply & Restart
                  </>
                )}
              </Button>

              {pathInfo?.isCustom && (
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={isApplying || isResetting}
                >
                  {isResetting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reset to Default
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Info Box */}
          <div className="rounded-md bg-muted/50 p-4 space-y-3">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  <strong>Multi-user setup:</strong> Point to a network share
                  (e.g., <code className="bg-muted px-1 rounded">\\server\share\data.db</code>)
                  so multiple users can access the same data.
                </p>
                <p>
                  <strong>Note:</strong> The database uses WAL mode for concurrent
                  access. All users should have read/write access to the folder.
                </p>
                <p>
                  <strong>Tip:</strong> Create a backup before changing the
                  database location.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Database Location</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <div className="rounded-md bg-amber-50 border border-amber-200 p-3">
                  <div className="flex gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">
                      <strong>Warning:</strong> The application will restart after
                      this change.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">New location:</p>
                  <code className="block text-xs bg-muted p-2 rounded break-all">
                    {newPath}
                  </code>
                </div>

                {validationResult?.exists && (
                  <div className="rounded-md bg-blue-50 border border-blue-200 p-3">
                    <div className="flex gap-2">
                      <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-800">
                        An existing database was found at this location. The app
                        will connect to it.
                      </p>
                    </div>
                  </div>
                )}

                {!validationResult?.exists && isAdmin && (
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                      id="copy-data"
                      checked={copyData}
                      onCheckedChange={(checked) => setCopyData(checked === true)}
                    />
                    <Label htmlFor="copy-data" className="text-sm cursor-pointer">
                      Copy existing data to new location
                    </Label>
                  </div>
                )}

                {!validationResult?.exists && !isAdmin && (
                  <div className="rounded-md bg-muted p-3">
                    <p className="text-sm text-muted-foreground">
                      A new empty database will be created at this location. Ask an
                      administrator to set up the shared database first if you want
                      to connect to existing data.
                    </p>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmApply}>
              Apply & Restart
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
