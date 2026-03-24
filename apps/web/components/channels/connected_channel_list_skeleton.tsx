import React from "react"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"

interface IProps {
  count?: number
}

const ConnectedChannelCardSkeleton = () => {
  return (
    <Card
      aria-hidden="true"
      className="relative gap-0 border-2 border-t-2 border-primary/20 border-t-emerald-500 py-0 shadow-sm ring-0"
    >
      <div className="absolute top-0 right-0 left-0 h-1 rounded-t-xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-zinc-700 dark:via-zinc-600 dark:to-zinc-700" />

      <CardContent className="p-5 md:p-6">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-0">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Skeleton className="h-12 w-12 flex-shrink-0 rounded-xl" />

            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-32 max-w-[70%]" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
              <Skeleton className="h-4 w-24 max-w-[50%]" />
            </div>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3 rounded-lg bg-muted/30 p-3 md:mb-5 md:gap-4 md:p-4 dark:bg-zinc-800/30">
          <div className="space-y-2">
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-6 w-14" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>

        <div className="flex gap-2">
          <Skeleton className="h-8 flex-1 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>

        <Skeleton className="mt-4 h-9 w-full rounded-lg md:hidden" />
      </CardContent>
    </Card>
  )
}

const ConnectedChannelListSkeleton: React.FC<IProps> = ({ count = 3 }) => {
  return (
    <div className="mb-10">
      <div className="mb-5 flex items-center gap-2">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: count }).map((_, index) => (
          <ConnectedChannelCardSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}

export default ConnectedChannelListSkeleton
