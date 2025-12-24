"use client"

import { useState } from "react"
import { HardDrive, Download, Upload, Loader2, AlertTriangle, Database, FileSpreadsheet, Info } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { toast } from "sonner"

type RestoreMethod = "database" | "excel" | null

interface RestoreOptions {
  suppliers: boolean
  events: boolean
  issues: boolean
  criticalMonitor: boolean
}

export function BackupSettingsCard() {
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false)
  const [selectedBackupPath, setSelectedBackupPath] = useState<string | null>(null)
  const [restoreMethod, setRestoreMethod] = useState<RestoreMethod>(null)
  const [restoreOptions, setRestoreOptions] = useState<RestoreOptions>({
    suppliers: true,
    events: true,
    issues: true,
    criticalMonitor: true,
  })

  const isElectron = typeof window !== "undefined" && window.electronAPI

  const handleCreateBackup = async () => {
    if (!isElectron) return

    setIsCreatingBackup(true)
    try {
      // Show save dialog
      const zipPath = await window.electronAPI.showBackupSaveDialog()
      if (!zipPath) {
        setIsCreatingBackup(false)
        return // User cancelled
      }

      // Create backup
      const result = await window.electronAPI.createBackup(zipPath)

      if (result.success) {
        toast.success("Backup created successfully", {
          description: `Saved to: ${result.path}`,
        })
      } else {
        toast.error("Backup failed", {
          description: result.message,
        })
      }
    } catch (error) {
      console.error("Failed to create backup:", error)
      toast.error("Failed to create backup", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsCreatingBackup(false)
    }
  }

  const handleSelectBackupFile = async () => {
    if (!isElectron) return

    try {
      const zipPath = await window.electronAPI.showBackupOpenDialog()
      if (!zipPath) return // User cancelled

      setSelectedBackupPath(zipPath)
      setRestoreMethod(null)
      // Reset options to all selected
      setRestoreOptions({
        suppliers: true,
        events: true,
        issues: true,
        criticalMonitor: true,
      })
      setShowRestoreConfirm(true)
    } catch (error) {
      console.error("Failed to select backup file:", error)
      toast.error("Failed to select backup file")
    }
  }

  const handleRestore = async () => {
    if (!isElectron || !selectedBackupPath || !restoreMethod) return

    // Check at least one option is selected
    const hasSelection = Object.values(restoreOptions).some(Boolean)
    if (!hasSelection) {
      toast.error("Please select at least one item to restore")
      return
    }

    setShowRestoreConfirm(false)
    setIsRestoring(true)

    try {
      let result
      if (restoreMethod === "database") {
        result = await window.electronAPI.restoreFromDatabase(selectedBackupPath, restoreOptions)
      } else {
        result = await window.electronAPI.restoreFromExcel(selectedBackupPath, restoreOptions)
      }

      if (result.success) {
        const restored = []
        if (result.stats?.suppliers) restored.push(`${result.stats.suppliers} suppliers`)
        if (result.stats?.events) restored.push(`${result.stats.events} events`)
        if (result.stats?.issues) restored.push(`${result.stats.issues} issues`)
        if (result.stats?.criticalMonitor) restored.push(`${result.stats.criticalMonitor} critical monitor records`)

        toast.success("Restore completed successfully", {
          description: restored.length > 0 ? `Restored: ${restored.join(", ")}` : "No data restored",
        })
        // Reload the page to reflect restored data
        window.location.reload()
      } else {
        toast.error("Restore failed", {
          description: result.message,
        })
      }
    } catch (error) {
      console.error("Failed to restore:", error)
      toast.error("Failed to restore backup", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsRestoring(false)
      setSelectedBackupPath(null)
      setRestoreMethod(null)
    }
  }

  const handleCloseRestoreDialog = () => {
    setShowRestoreConfirm(false)
    setSelectedBackupPath(null)
    setRestoreMethod(null)
  }

  const toggleOption = (key: keyof RestoreOptions) => {
    setRestoreOptions((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const selectAll = () => {
    setRestoreOptions({
      suppliers: true,
      events: true,
      issues: true,
      criticalMonitor: true,
    })
  }

  const deselectAll = () => {
    setRestoreOptions({
      suppliers: false,
      events: false,
      issues: false,
      criticalMonitor: false,
    })
  }

  const allSelected = Object.values(restoreOptions).every(Boolean)
  const noneSelected = Object.values(restoreOptions).every((v) => !v)

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-primary" />
            <CardTitle>Backup & Restore</CardTitle>
          </div>
          <CardDescription>
            Create backups of your data or restore from a previous backup
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Create Backup Section */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span className="text-base font-medium">Create Backup</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Save database and Excel exports to a ZIP file
              </p>
            </div>
            <Button
              onClick={handleCreateBackup}
              disabled={isCreatingBackup || isRestoring}
            >
              {isCreatingBackup ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Backup"
              )}
            </Button>
          </div>

          <div className="border-t" />

          {/* Restore Section */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <span className="text-base font-medium">Restore from Backup</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Load data from a previously created backup ZIP file
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleSelectBackupFile}
              disabled={isCreatingBackup || isRestoring}
            >
              {isRestoring ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Restoring...
                </>
              ) : (
                "Select Backup File"
              )}
            </Button>
          </div>

          {/* Info box */}
          <div className="rounded-md bg-muted/50 p-4 space-y-3">
            <p className="text-sm font-medium">Backup ZIP contains:</p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li><strong>database.db</strong> — exact copy of all data</li>
              <li><strong>Suppliers.xlsx</strong> — all supplier records</li>
              <li><strong>Events.xlsx</strong> — change log</li>
              <li><strong>Issues.xlsx</strong> — issue tracker</li>
              <li><strong>CriticalMonitor.xlsx</strong> — critical outsourcing data</li>
            </ul>

            <div className="border-t pt-3 mt-3">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Database restore:</strong> Fastest and most accurate. Restores everything exactly as it was.</p>
                  <p><strong>Excel restore:</strong> Use only if you manually edited the Excel files in the backup. Always restore from the original ZIP file.</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={showRestoreConfirm} onOpenChange={handleCloseRestoreDialog}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Restore from Backup</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <div className="rounded-md bg-amber-50 border border-amber-200 p-3">
                  <div className="flex gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">
                      <strong>Warning:</strong> Selected data will be replaced. This action cannot be undone.
                    </p>
                  </div>
                </div>

                {/* Step 1: Choose restore method */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">1. Choose restore method:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRestoreMethod("database")}
                      className={`p-3 rounded-lg border-2 text-left transition-colors ${
                        restoreMethod === "database"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-sm">From Database</p>
                          <p className="text-xs text-muted-foreground">Fast & exact</p>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRestoreMethod("excel")}
                      className={`p-3 rounded-lg border-2 text-left transition-colors ${
                        restoreMethod === "excel"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-sm">From Excel</p>
                          <p className="text-xs text-muted-foreground">If you edited files</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Step 2: Choose what to restore */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">2. Select data to restore:</p>
                    <div className="flex gap-2 text-xs">
                      <button
                        type="button"
                        onClick={selectAll}
                        className="text-primary hover:underline"
                        disabled={allSelected}
                      >
                        Select all
                      </button>
                      <span className="text-muted-foreground">|</span>
                      <button
                        type="button"
                        onClick={deselectAll}
                        className="text-primary hover:underline"
                        disabled={noneSelected}
                      >
                        Clear all
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3 rounded-lg border bg-muted/30">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="restore-suppliers"
                        checked={restoreOptions.suppliers}
                        onCheckedChange={() => toggleOption("suppliers")}
                      />
                      <Label htmlFor="restore-suppliers" className="text-sm cursor-pointer">
                        Suppliers
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="restore-events"
                        checked={restoreOptions.events}
                        onCheckedChange={() => toggleOption("events")}
                      />
                      <Label htmlFor="restore-events" className="text-sm cursor-pointer">
                        Events (Change Log)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="restore-issues"
                        checked={restoreOptions.issues}
                        onCheckedChange={() => toggleOption("issues")}
                      />
                      <Label htmlFor="restore-issues" className="text-sm cursor-pointer">
                        Issues
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="restore-critical"
                        checked={restoreOptions.criticalMonitor}
                        onCheckedChange={() => toggleOption("criticalMonitor")}
                      />
                      <Label htmlFor="restore-critical" className="text-sm cursor-pointer">
                        Critical Monitor
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Restore method info */}
                {restoreMethod && (
                  <div className="rounded-md bg-blue-50 border border-blue-200 p-3">
                    <div className="flex gap-2">
                      <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-800">
                        {restoreMethod === "database" ? (
                          <>
                            <strong>Database restore</strong> uses the database.db file from the backup ZIP for fast, exact restoration.
                          </>
                        ) : (
                          <>
                            <strong>Excel restore</strong> reads from the Excel files in the backup ZIP. Use this only if you manually edited the Excel files.
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestore}
              disabled={!restoreMethod || noneSelected}
              className="bg-destructive hover:bg-destructive/90"
            >
              Restore Selected Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
