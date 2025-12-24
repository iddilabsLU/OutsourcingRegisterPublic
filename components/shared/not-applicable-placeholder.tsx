import { CloudOff, ShieldOff } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface NotApplicablePlaceholderProps {
  type: "cloud" | "critical"
  title: string
  description: string
  circularRef: string
  additionalBadge?: string
}

/**
 * Reusable placeholder component for N/A sections in supplier details
 * Used when cloud services or critical functions are not applicable
 */
export function NotApplicablePlaceholder({
  type,
  title,
  description,
  circularRef,
  additionalBadge,
}: NotApplicablePlaceholderProps) {
  const Icon: LucideIcon = type === "cloud" ? CloudOff : ShieldOff
  const iconSize = type === "cloud" ? "h-10 w-10" : "h-12 w-12"
  const paddingY = type === "cloud" ? "py-8" : "py-12"

  return (
    <div
      className={`flex flex-col items-center justify-center ${paddingY} px-6 border-2 border-dashed border-border rounded-lg bg-muted/20`}
    >
      <Icon className={`${iconSize} text-muted-foreground/60 mb-3`} />
      <h4
        className={`${type === "cloud" ? "text-sm" : "text-base"} font-semibold text-foreground mb-2 text-center`}
      >
        {title}
      </h4>
      <div className="text-sm text-muted-foreground text-center max-w-2xl mx-auto mb-3 leading-relaxed">
        {description.split('. ').map((sentence, index, array) => (
          <p key={index} className={index < array.length - 1 ? "mb-1" : ""}>
            {sentence}{index < array.length - 1 ? '.' : ''}
          </p>
        ))}
      </div>
      <div className="flex gap-2">
        {additionalBadge && (
          <Badge variant="secondary" className="text-xs">
            {additionalBadge}
          </Badge>
        )}
        <Badge variant="outline" className="text-xs">
          {circularRef}
        </Badge>
      </div>
    </div>
  )
}
