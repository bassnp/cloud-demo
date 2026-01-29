import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Extended input props with error state support
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Whether the input is in an error state */
  error?: boolean;
}

/**
 * Input Component
 * 
 * Enhanced form input with:
 * - Theme-aware focus ring and border transitions
 * - Tangerine error state styling
 * - Smooth 200ms transitions for all state changes
 * - Disabled state with reduced opacity
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles
          "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-base",
          "ring-offset-background transition-all duration-200",
          // File input styles
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          // Placeholder styles
          "placeholder:text-muted-foreground",
          // Focus styles - Theme-aware accent
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-pacific-blue-600/50 dark:focus-visible:ring-lime-moss-500/50",
          "focus-visible:border-pacific-blue-600 dark:focus-visible:border-lime-moss-500",
          // Default border
          error
            ? "border-tangerine-500 ring-2 ring-tangerine-500/20"
            : "border-input",
          // Disabled state
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/50",
          "md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
