"use client"

import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"

const StatusBadge = ({ status }: { status: "active" | "warning" | "error" }) => {
  const config = {
    active: {
      label: "Đang hoạt động",
      className:
        "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
      dot: "bg-emerald-500 dark:bg-emerald-400",
    },
    warning: {
      label: "Cần chú ý",
      className:
        "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
      dot: "bg-amber-500 dark:bg-amber-400",
    },
    error: {
      label: "Không hoạt động",
      className: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
      dot: "bg-red-500 dark:bg-red-400",
    },
  }

  const { label, className, dot } = config[status]

  return (
    <Badge variant="outline" className={cn("gap-1.5 px-2.5 py-0.5 font-medium", className)}>
      <span className={cn("h-1.5 w-1.5 animate-pulse rounded-full", dot)} />
      {label}
    </Badge>
  )
}

export default StatusBadge
