import { Card, CardContent } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"

function LinkedAccountCardSkeleton() {
  return (
    <Card className="group relative overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-sm">
      <CardContent className="space-y-5 p-4 md:p-5">
        <div className="flex items-start gap-3">
          <Skeleton className="size-14 shrink-0 rounded-[20px]" />
          <div className="flex flex-wrap gap-2.5">
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-7 w-28 rounded-full" />
          </div>
        </div>

        <div className="rounded-[24px] border border-border/60 bg-background p-3.5">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-40 max-w-[80%]" />
              <Skeleton className="h-3 w-44 max-w-[90%]" />
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-border/60 bg-background p-3.5">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-32 max-w-[75%]" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function LinkedAccountsGridSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border/60 bg-linear-to-br from-background via-background to-muted/20 p-4 shadow-sm md:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-56 max-w-[80%]" />
          </div>

          <Skeleton className="h-10 w-full rounded-xl sm:w-40" />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-border/60 bg-card/70 p-3">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="mt-2 h-7 w-14" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <LinkedAccountCardSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}
