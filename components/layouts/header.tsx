"use client"

import Image from "next/image"
import { Package, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/providers/auth-provider"
import { ROLE_LABELS } from "@/lib/types/auth"

export function Header() {
  const { authSettings, currentUser, isAuthenticated, logout, isMasterOverride } = useAuth()

  const showUserInfo = authSettings?.authEnabled && isAuthenticated

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary bg-primary">
      <div className="flex h-12 items-center justify-between px-8">
        {/* Logo/Brand */}
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary-foreground" />
          <span className="text-base font-bold text-primary-foreground">
            Services & Cloud Outsourcing Register
          </span>
        </div>

        {/* User Info & Logo */}
        <div className="flex items-center gap-4">
          {/* User display when authenticated */}
          {showUserInfo && currentUser && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-primary-foreground">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {currentUser.displayName}
                </span>
                <Badge
                  variant="secondary"
                  className="text-xs bg-primary-foreground/20 text-primary-foreground border-none"
                >
                  {isMasterOverride ? "Master" : ROLE_LABELS[currentUser.role]}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/10 gap-1"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          )}

          {/* Extended Logo */}
          <Image
            src="/White short logo.png"
            alt="Logo"
            width={120}
            height={32}
            className="h-8 w-auto"
            priority
          />
        </div>
      </div>
    </header>
  )
}
