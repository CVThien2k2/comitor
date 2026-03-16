'use client'

import { Button } from '@workspace/ui/components/button'
import { Textarea } from '@workspace/ui/components/textarea'
import { Separator } from '@workspace/ui/components/separator'
import { useState } from 'react'
import { Paperclip, Smile, Send, Sparkles } from 'lucide-react'

interface MessageInputProps {
  onSend?: (message: string) => void
}

export function MessageInput({ onSend }: MessageInputProps) {
  const [message, setMessage] = useState('')

  const handleSend = () => {
    if (message.trim()) {
      onSend?.(message)
      setMessage('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSend()
    }
  }

  return (
    <div className="p-4 bg-background border-t">
      <div className="border rounded-lg p-3 bg-card">
        <Textarea
          value={message}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Viết câu trả lời..."
          rows={3}
          className="w-full bg-transparent border-none focus:ring-0 text-sm resize-none"
        />
        <Separator className="my-3" />
        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-secondary"
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-secondary"
            >
              <Smile className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 text-xs font-medium"
            >
              <Sparkles className="w-3 h-3" />
              Gợi ý AI
            </Button>
          </div>
          <Button
            onClick={handleSend}
            size="sm"
            className="gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            <Send className="w-3 h-3" />
            Gửi
          </Button>
        </div>
      </div>
    </div>
  )
}
