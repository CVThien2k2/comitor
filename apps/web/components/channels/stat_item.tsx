"use client"

const StatItem = ({ icon: Icon, value, label }: { icon: React.ElementType; value: string | number; label: string }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 dark:bg-zinc-800">
        <Icon className="h-4 w-4 text-muted-foreground dark:text-zinc-500" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground dark:text-zinc-100">{value.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground dark:text-zinc-500">{label}</p>
      </div>
    </div>
  )
}

export default StatItem
