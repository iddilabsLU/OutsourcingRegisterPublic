"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Eye, EyeOff, AlertTriangle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { masterLoginSchema, type MasterLoginFormData } from "@/lib/validations/auth-schema"
import { useAuth } from "@/components/providers/auth-provider"

interface MasterLoginFormProps {
  onBack: () => void
}

export function MasterLoginForm({ onBack }: MasterLoginFormProps) {
  const { loginWithMaster } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<MasterLoginFormData>({
    resolver: zodResolver(masterLoginSchema),
    defaultValues: {
      password: "",
    },
  })

  const onSubmit = async (data: MasterLoginFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await loginWithMaster(data.password)

      if (!result.success) {
        setError(result.error ?? "Invalid master password")
      }
      // On success, the AuthProvider will update state and overlay will dismiss
    } catch (err) {
      setError("An unexpected error occurred")
      console.error("Master login error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Warning banner */}
      <div className="rounded-md bg-amber-50 border border-amber-200 p-4">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-amber-800">
              Master Password Recovery
            </p>
            <p className="text-sm text-amber-700">
              Use this only if you&apos;ve forgotten your regular password.
              Master login grants temporary administrator access.
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Error message */}
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Master Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Master Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter master password"
                      autoComplete="off"
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

          {/* Submit button */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Sign in with Master Password"
            )}
          </Button>

          {/* Back link */}
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={onBack}
            disabled={isSubmitting}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to regular login
          </Button>
        </form>
      </Form>
    </div>
  )
}
