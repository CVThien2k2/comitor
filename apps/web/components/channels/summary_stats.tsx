"use client"

import { TrendingUp, Users, CheckCircle2 } from "lucide-react"

interface IProps {
  connectedChannels: any[]
}

const SummaryStats: React.FC<IProps> = ({ connectedChannels }) => {
  const totalMessages = 400
  const totalConversations = 200
  const activeChannels = 4

  return (
    <div className="mb-8 grid grid-cols-1 gap-3 rounded-xl border border-primary/10 bg-gradient-to-r from-primary/5 via-primary/3 to-transparent p-4 md:grid-cols-3 md:gap-4 md:p-5 dark:border-primary/20 dark:from-primary/10 dark:via-primary/5 dark:to-transparent">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20">
          <TrendingUp className="h-5 w-5 text-primary dark:text-primary/90" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground dark:text-zinc-100">{totalMessages.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground dark:text-zinc-500">tin nhắn/ngày</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
          <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground dark:text-zinc-100">{totalConversations.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground dark:text-zinc-500">hội thoại đang mở</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50">
          <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground dark:text-zinc-100">{activeChannels}</p>
          <p className="text-sm text-muted-foreground dark:text-zinc-500">kênh hoạt động</p>
        </div>
      </div>
    </div>
  )
}

export default SummaryStats
