'use client'

import { Button } from '@workspace/ui/components/button'
import { Card } from '@workspace/ui/components/card'
import { Sparkles, X } from 'lucide-react'

interface AISuggestionProps {
  title: string
  description: string
  onAccept?: () => void
}

export function AISuggestion({
  title,
  description,
  onAccept,
}: AISuggestionProps) {
  return (
    <div className="flex justify-center py-2">
      <Card className="bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-700 p-4 w-full max-w-sm">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">
              AI gợi ý
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-indigo-100 dark:hover:bg-indigo-800/50"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
        <h4 className="font-semibold text-sm text-indigo-900 dark:text-indigo-200 mb-1">
          {title}
        </h4>
        <p className="text-sm text-indigo-700 dark:text-indigo-300 mb-4">{description}</p>
        <Button
          onClick={onAccept}
          className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
          size="sm"
        >
          {title} ngay
        </Button>
      </Card>
    </div>
  )
}
