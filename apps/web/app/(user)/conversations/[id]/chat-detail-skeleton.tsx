import { cn } from "@workspace/ui/lib/utils"

export function ChatDetailSkeleton() {
  return (
    <div className="flex h-full flex-col bg-background">
      <div className="border-b border-border bg-muted/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="size-10 animate-pulse rounded-full bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-40 animate-pulse rounded bg-muted" />
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto bg-background px-4 py-4">
        <div className="flex flex-col gap-3 py-4">
          {Array.from({ length: 10 }).map((_, i) => {
            const isLeft = i % 2 === 0
            return (
              <div
                key={i}
                className={cn("flex max-w-[70%] gap-2.5", isLeft ? "self-start" : "flex-row-reverse self-end")}
              >
                {isLeft && <div className="size-8 shrink-0 animate-pulse rounded-full bg-muted" />}
                <div className={cn("space-y-1.5", !isLeft && "flex flex-col items-end")}>
                  <div className="h-3 w-16 animate-pulse rounded bg-muted" />
                  <div
                    className={cn(
                      "h-10 animate-pulse rounded-2xl bg-muted",
                      isLeft ? "w-48 rounded-tl-md" : "w-40 rounded-tr-md"
                    )}
                  />
                  <div className="h-3 w-10 animate-pulse rounded bg-muted" />
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="border-t border-border p-4">
        <div className="h-20 animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  )
}
