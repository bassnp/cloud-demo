/**
 * Skeleton Component - Phase 4 UI Overhaul
 *
 * Loading placeholder components with shimmer animation.
 * Provides visual feedback during content loading.
 */

import { cn } from "@/lib/utils"

/**
 * Base skeleton component with shimmer animation
 *
 * @example
 * ```tsx
 * <Skeleton className="h-12 w-12 rounded-full" />
 * <Skeleton className="h-4 w-[250px]" />
 * ```
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        // Base skeleton styles
        "relative overflow-hidden rounded-md bg-muted",
        // Shimmer animation overlay
        "after:absolute after:inset-0",
        "after:bg-gradient-to-r after:from-transparent after:via-white/10 after:to-transparent",
        "after:animate-shimmer",
        "after:bg-[length:200%_100%]",
        className
      )}
      {...props}
    />
  )
}

/**
 * Media card skeleton for loading media grids
 */
function MediaCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border/50 bg-card/50",
        "break-inside-avoid",
        className
      )}
    >
      {/* Image placeholder with random aspect ratio simulation */}
      <Skeleton className="aspect-[4/3] w-full" />
      {/* Content area */}
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

/**
 * Tall media card skeleton variant
 */
function MediaCardSkeletonTall({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border/50 bg-card/50",
        "break-inside-avoid",
        className
      )}
    >
      {/* Taller image placeholder */}
      <Skeleton className="aspect-[3/4] w-full" />
      {/* Content area */}
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

/**
 * Grid of media card skeletons for loading states
 *
 * @param count - Number of skeleton cards to render
 */
function MediaGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        // Alternate between regular and tall variants for visual interest
        index % 3 === 0 ? (
          <MediaCardSkeletonTall key={index} />
        ) : (
          <MediaCardSkeleton key={index} />
        )
      ))}
    </div>
  )
}

/**
 * Table row skeleton for loading table data
 */
function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-border/50">
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn(
            "h-4",
            index === 0 ? "w-10" : "flex-1"
          )}
        />
      ))}
    </div>
  )
}

/**
 * Card skeleton for loading card content
 */
function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/50 bg-card/50 p-6 space-y-4",
        className
      )}
    >
      <Skeleton className="h-6 w-1/3" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  )
}

/**
 * Avatar skeleton for loading user avatars
 */
function AvatarSkeleton({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16",
  }

  return (
    <Skeleton className={cn("rounded-full", sizeClasses[size])} />
  )
}

/**
 * Text line skeleton for loading text content
 */
function TextSkeleton({
  lines = 3,
  className,
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn(
            "h-4",
            // Last line is shorter for natural look
            index === lines - 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  )
}

export {
  Skeleton,
  MediaCardSkeleton,
  MediaCardSkeletonTall,
  MediaGridSkeleton,
  TableRowSkeleton,
  CardSkeleton,
  AvatarSkeleton,
  TextSkeleton,
}
