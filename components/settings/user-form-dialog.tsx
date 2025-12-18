"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Eye, EyeOff } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  createUserSchema,
  editUserSchema,
  type CreateUserFormData,
  type EditUserFormData,
} from "@/lib/validations/auth-schema"
import type { User, UserRole } from "@/lib/types/auth"
import { ROLE_LABELS, ROLE_DESCRIPTIONS } from "@/lib/types/auth"
import { toast } from "sonner"

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  mode: "create" | "edit"
  user?: User
}

const roles: UserRole[] = ["admin", "editor", "viewer"]

export function UserFormDialog({
  open,
  onOpenChange,
  onSuccess,
  mode,
  user,
}: UserFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const isCreate = mode === "create"
  const schema = isCreate ? createUserSchema : editUserSchema

  const form = useForm<CreateUserFormData | EditUserFormData>({
    resolver: zodResolver(schema),
    defaultValues: isCreate
      ? {
          username: "",
          password: "",
          displayName: "",
          role: "editor" as UserRole,
        }
      : {
          displayName: user?.displayName ?? "",
          password: "",
          role: user?.role ?? "editor",
        },
  })

  // Reset form when dialog opens/closes or user changes
  useEffect(() => {
    if (open) {
      if (isCreate) {
        form.reset({
          username: "",
          password: "",
          displayName: "",
          role: "editor",
        })
      } else if (user) {
        form.reset({
          displayName: user.displayName,
          password: "",
          role: user.role,
        })
      }
    }
  }, [open, isCreate, user, form])

  const handleClose = () => {
    form.reset()
    onOpenChange(false)
  }

  const onSubmit = async (data: CreateUserFormData | EditUserFormData) => {
    if (!window.electronAPI) return

    setIsSubmitting(true)
    try {
      if (isCreate) {
        const createData = data as CreateUserFormData
        await window.electronAPI.createUser({
          username: createData.username,
          password: createData.password,
          displayName: createData.displayName,
          role: createData.role,
        })
        toast.success("User created", {
          description: `${createData.displayName} has been created successfully.`,
        })
      } else if (user) {
        const editData = data as EditUserFormData
        await window.electronAPI.updateUser(user.id, {
          displayName: editData.displayName,
          password: editData.password || undefined,  // Empty string becomes undefined
          role: editData.role,
        })
        toast.success("User updated", {
          description: `${editData.displayName} has been updated successfully.`,
        })
      }
      onSuccess()
      handleClose()
    } catch (error) {
      console.error("Failed to save user:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"

      if (errorMessage.includes("Username already exists")) {
        form.setError("username" as keyof typeof data, {
          type: "manual",
          message: "This username is already taken",
        })
      } else {
        toast.error(`Failed to ${isCreate ? "create" : "update"} user`, {
          description: errorMessage,
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isCreate ? "Add New User" : "Edit User"}</DialogTitle>
          <DialogDescription>
            {isCreate
              ? "Create a new user account with the specified role."
              : "Update user details. Leave password blank to keep unchanged."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Username - only for create */}
            {isCreate && (
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter username"
                        autoComplete="off"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Letters, numbers, and underscores only
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Display Name */}
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter display name"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Password
                    {!isCreate && (
                      <span className="text-muted-foreground font-normal ml-1">
                        (optional)
                      </span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder={isCreate ? "Enter password" : "Leave blank to keep current"}
                        autoComplete="new-password"
                        disabled={isSubmitting}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isSubmitting}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Role */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSubmitting || (user?.isSystemUser && !isCreate)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role} value={role}>
                          <div className="flex flex-col">
                            <span>{ROLE_LABELS[role]}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {field.value && ROLE_DESCRIPTIONS[field.value as UserRole]}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isCreate ? "Creating..." : "Saving..."}
                  </>
                ) : isCreate ? (
                  "Create User"
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
