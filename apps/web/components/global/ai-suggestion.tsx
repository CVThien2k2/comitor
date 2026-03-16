"use client"

import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import { Sparkles, X } from "lucide-react"

interface AISuggestionProps {
  title: string
  description: string
  onAccept?: () => void
}

export function AISuggestion({ title, description, onAccept }: AISuggestionProps) {
  return (
    <div className="flex justify-center py-2">
      <Card className="w-full max-w-sm border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-700 dark:bg-indigo-900/30">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">AI gợi ý</span>
          </div>
          <Button variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-indigo-100 dark:hover:bg-indigo-800/50">
            <X className="h-3 w-3" />
          </Button>
        </div>
        <h4 className="mb-1 text-sm font-semibold text-indigo-900 dark:text-indigo-200">{title}</h4>
        <p className="mb-4 text-sm text-indigo-700 dark:text-indigo-300">{description}</p>
        <Button onClick={onAccept} className="w-full bg-indigo-600 text-white hover:bg-indigo-700" size="sm">
          {title} ngay
        </Button>
      </Card>
    </div>
  )
}
