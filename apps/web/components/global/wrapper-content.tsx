import { cn } from "@workspace/ui/lib/utils"
import type { ReactNode } from "react"

interface PageContentShellProps {
  children: ReactNode
  className?: string
}

export function Wrapper({ children, className }: PageContentShellProps) {
  return (
    <section
      className={cn(
        "flex min-h-full flex-col px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 xl:px-10 xl:py-8 2xl:px-14 2xl:py-10",
        className
      )}
    >
      {children}
    </section>
  )
}
