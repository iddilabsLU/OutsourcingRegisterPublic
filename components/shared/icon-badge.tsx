"use client"

import { cn } from "@/lib/utils"
import { type LucideIcon } from "lucide-react"

interface IconBadgeProps {
  icon: LucideIcon
  variant?: "type1" | "type2"
  size?: "sm" | "md" | "lg"
  className?: string
}

export function IconBadge({
  icon: Icon,
  variant = "type1",
  size = "md",
  className,
}: IconBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-lg transition-colors cursor-pointer",
        {
          // Type1 - Dark background with light icon
          "bg-primary text-primary-foreground": variant === "type1",

          // Type2 - Light background with dark icon
          "bg-secondary text-secondary-foreground": variant === "type2",

          // Sizes
          "h-10 w-10": size === "sm",
          "h-12 w-12": size === "md",
          "h-14 w-14": size === "lg",
        },
        className
      )}
    >
      <Icon
        className={cn({
          "h-5 w-5": size === "sm",
          "h-6 w-6": size === "md",
          "h-7 w-7": size === "lg",
        })}
      />
    </div>
  )
}
