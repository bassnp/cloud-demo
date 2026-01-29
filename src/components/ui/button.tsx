import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Button Component - Cloud Demo Design System
 * 
 * Enhanced button variants with:
 * - Gradient backgrounds for primary actions
 * - Glow shadow effects on hover
 * - Press feedback with scale animation
 * - Smooth transitions throughout
 * - Theme-aware colors (Pacific Blue light / Lime Moss dark)
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-pacific-blue-600 to-pacific-blue-700 text-white shadow-lg shadow-pacific-blue-600/25 hover:from-pacific-blue-500 hover:to-pacific-blue-600 hover:shadow-xl hover:shadow-pacific-blue-600/30 dark:from-lime-moss-500 dark:to-lime-moss-600 dark:text-lime-moss-950 dark:shadow-lime-moss-500/25 dark:hover:from-lime-moss-400 dark:hover:to-lime-moss-500 dark:hover:shadow-lime-moss-500/30",
        destructive:
          "bg-gradient-to-r from-tangerine-500 to-tangerine-600 text-white shadow-lg shadow-tangerine-500/25 hover:from-tangerine-400 hover:to-tangerine-500 hover:shadow-xl hover:shadow-tangerine-500/30",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-primary hover:shadow-glow-sm hover:shadow-primary/20",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-primary/10 hover:text-primary active:bg-primary/15",
        link:
          "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
