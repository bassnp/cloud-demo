import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Badge Component - Cloud Demo Design System
 *
 * Enhanced badge variants with:
 * - Brand color palette integration
 * - Subtle shadow effects
 * - Smooth hover transitions
 * - Theme-aware colors (Pacific Blue light / Lime Moss dark)
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-pacific-blue-600/90 text-white shadow-md shadow-pacific-blue-600/25 hover:bg-pacific-blue-700 dark:bg-lime-moss-500/90 dark:text-lime-moss-950 dark:shadow-lime-moss-500/25 dark:hover:bg-lime-moss-600",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-tangerine-500/90 text-white shadow-md shadow-tangerine-500/25 hover:bg-tangerine-600",
        success:
          "border-transparent bg-lime-moss-500/90 text-lime-moss-950 shadow-md shadow-lime-moss-500/25 hover:bg-lime-moss-600",
        outline: 
          "text-foreground border-border hover:bg-muted",
        muted:
          "border-transparent bg-muted text-muted-foreground shadow-md hover:bg-muted/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
