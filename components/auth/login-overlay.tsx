"use client"

import { useState } from "react"
import { Package, Shield } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoginForm } from "./login-form"
import { MasterLoginForm } from "./master-login-form"
import { useAuth } from "@/components/providers/auth-provider"

type LoginView = "normal" | "master"

export function LoginOverlay() {
  const { isLoading, authSettings, isAuthenticated } = useAuth()
  const [view, setView] = useState<LoginView>("normal")

  // Don't show overlay if:
  // - Still loading
  // - Auth is disabled
  // - Already authenticated
  if (isLoading || !authSettings?.authEnabled || isAuthenticated) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="w-full max-w-md px-4">
        <Card className="shadow-lg">
          <CardHeader className="space-y-4 text-center pb-2">
            {/* App branding */}
            <div className="flex items-center justify-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Package className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>

            <div>
              <CardTitle className="text-xl">
                {view === "normal" ? "Welcome Back" : "Password Recovery"}
              </CardTitle>
              <CardDescription className="mt-1">
                {view === "normal"
                  ? "Sign in to access the Supplier Outsourcing Register"
                  : "Use the master password to regain access"}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pt-4">
            {view === "normal" ? (
              <LoginForm onForgotPassword={() => setView("master")} />
            ) : (
              <MasterLoginForm onBack={() => setView("normal")} />
            )}
          </CardContent>
        </Card>

        {/* Security note */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-3 w-3" />
          <span>Secured local authentication</span>
        </div>
      </div>
    </div>
  )
}
