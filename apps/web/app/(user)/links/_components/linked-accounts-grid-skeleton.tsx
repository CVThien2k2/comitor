"use client"

const SKELETON_ITEMS = Array.from({ length: 3 })

function LinkedAccountCardSkeleton({ index }: { index: number }) {
  return (
    <div
      key={`linked-account-skeleton-${index}`}
      className="overflow-hidden rounded-[28px] border border-border/70 bg-card p-4 shadow-sm md:p-5"
    >
      <div className="animate-pulse space-y-5">
        <div className="flex items-start gap-3">
          <div className="size-14 shrink-0 rounded-[20px] border border-border/60 bg-muted/50" />
          <div className="flex flex-wrap gap-2.5">
            <div className="h-6 w-24 rounded-full bg-muted/60" />
            <div className="h-6 w-20 rounded-full bg-muted/60" />
            <div className="h-6 w-16 rounded-full bg-muted/60" />
          </div>
        </div>

        <div className="rounded-[24px] border border-border/60 bg-background p-3.5">
          <div className="flex items-center gap-3">
            <div className="size-11 shrink-0 rounded-full bg-muted/60" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3 w-28 rounded bg-muted/60" />
              <div className="h-5 w-40 max-w-[85%] rounded bg-muted/60" />
              <div className="h-3 w-44 max-w-[95%] rounded bg-muted/60" />
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-border/60 bg-background p-3.5">
          <div className="flex items-center gap-3">
            <div className="size-11 shrink-0 rounded-full bg-muted/60" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3 w-16 rounded bg-muted/60" />
              <div className="h-5 w-36 max-w-[80%] rounded bg-muted/60" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function LinkedAccountsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {SKELETON_ITEMS.map((_, index) => (
        <LinkedAccountCardSkeleton key={`linked-account-skeleton-${index}`} index={index} />
      ))}
    </div>
  )
}
