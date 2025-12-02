import type { LucideIcon } from "lucide-react"

interface PlaceholderViewProps {
  icon: LucideIcon
  title: string
  description: string
}

export function PlaceholderView({ icon: Icon, title, description }: PlaceholderViewProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 p-16 text-center">
      <Icon className="h-16 w-16 text-muted-foreground/50 mb-4" />
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md">
        {description}
      </p>
    </div>
  )
}
