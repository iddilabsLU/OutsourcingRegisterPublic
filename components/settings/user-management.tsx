"use client"

import { useState, useEffect, useCallback } from "react"
import { Users, Plus, Pencil, Trash2, Loader2, ShieldCheck, Edit3, Eye } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { UserFormDialog } from "./user-form-dialog"
import { useAuth } from "@/components/providers/auth-provider"
import type { User, UserRole } from "@/lib/types/auth"
import { ROLE_LABELS } from "@/lib/types/auth"
import { toast } from "sonner"

// Role badge colors
const roleBadgeVariants: Record<UserRole, "default" | "secondary" | "outline"> = {
  admin: "default",
  editor: "secondary",
  viewer: "outline",
}

// Role icons
const roleIcons: Record<UserRole, React.ComponentType<{ className?: string }>> = {
  admin: ShieldCheck,
  editor: Edit3,
  viewer: Eye,
}

export function UserManagement() {
  const { currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const isElectron = typeof window !== "undefined" && window.electronAPI

  // Load users
  const loadUsers = useCallback(async () => {
    if (!isElectron) return

    setIsLoading(true)
    try {
      const userList = await window.electronAPI.getAllUsers()
      setUsers(userList)
    } catch (error) {
      console.error("Failed to load users:", error)
      toast.error("Failed to load users")
    } finally {
      setIsLoading(false)
    }
  }, [isElectron])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  // Handle delete
  const handleDeleteClick = async (user: User) => {
    if (!isElectron) return

    // Check if can delete
    try {
      const result = await window.electronAPI.canDeleteUser(user.id)
      if (!result.canDelete) {
        setDeleteError(result.reason ?? "Cannot delete this user")
        setDeletingUser(user)
        return
      }
      setDeleteError(null)
      setDeletingUser(user)
    } catch (error) {
      console.error("Failed to check delete:", error)
      toast.error("Failed to check if user can be deleted")
    }
  }

  const handleConfirmDelete = async () => {
    if (!isElectron || !deletingUser) return

    setIsDeleting(true)
    try {
      await window.electronAPI.deleteUser(deletingUser.id)
      toast.success("User deleted", {
        description: `${deletingUser.displayName} has been deleted.`,
      })
      await loadUsers()
      setDeletingUser(null)
    } catch (error) {
      console.error("Failed to delete user:", error)
      toast.error("Failed to delete user")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleUserSaved = () => {
    loadUsers()
    setShowAddDialog(false)
    setEditingUser(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle>User Management</CardTitle>
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
          <CardDescription>
            Manage user accounts and their access levels
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found. Add your first user to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Display Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const RoleIcon = roleIcons[user.role]
                  const isCurrentUser = currentUser?.id === user.id

                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.username}
                        {user.isSystemUser && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            System
                          </Badge>
                        )}
                        {isCurrentUser && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            You
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{user.displayName}</TableCell>
                      <TableCell>
                        <Badge variant={roleBadgeVariants[user.role]} className="gap-1">
                          <RoleIcon className="h-3 w-3" />
                          {ROLE_LABELS[user.role]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingUser(user)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(user)}
                            disabled={isCurrentUser}
                            title={isCurrentUser ? "Cannot delete yourself" : "Delete user"}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add user dialog */}
      <UserFormDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={handleUserSaved}
        mode="create"
      />

      {/* Edit user dialog */}
      {editingUser && (
        <UserFormDialog
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
          onSuccess={handleUserSaved}
          mode="edit"
          user={editingUser}
        />
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteError ? "Cannot Delete User" : "Delete User?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteError ? (
                deleteError
              ) : (
                <>
                  Are you sure you want to delete{" "}
                  <span className="font-medium">{deletingUser?.displayName}</span>? This action
                  cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {deleteError ? (
              <AlertDialogCancel>Close</AlertDialogCancel>
            ) : (
              <>
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </AlertDialogAction>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
