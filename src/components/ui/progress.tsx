"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

/**
 * Progress Component - Cloud Demo Design System
 *
 * Enhanced progress bar with:
 * - Theme-aware gradient fill
 * - Shimmer animation overlay
 * - GPU-accelerated transform animation
 * - Smooth transitions
 */
const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-3 w-full overflow-hidden rounded-full",
      "bg-pacific-blue-100 dark:bg-lime-moss-950",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        "h-full w-full flex-1 rounded-full",
        // Premium gradient fill - Theme-aware
        "bg-gradient-to-r from-pacific-blue-600 to-lime-moss-500",
        "dark:from-lime-moss-600 dark:to-lime-moss-400",
        // Smooth transform animation
        "transition-transform duration-300 ease-out",
        // Shimmer effect overlay
        "relative overflow-hidden",
        // GPU acceleration
        "will-change-transform"
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    >
      {/* Shimmer Animation Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer" />
    </ProgressPrimitive.Indicator>
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
