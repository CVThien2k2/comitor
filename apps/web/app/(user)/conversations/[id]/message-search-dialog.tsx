"use client"

import type { MessageItem } from "@/api/conversations"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { useMemo, useState } from "react"

type MessageSearchDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  messages: MessageItem[]
}

type MessageSearchResultItem = { id: string; text: string; createdAt: string }

const getMessageTextForSearch = (message: MessageItem): string => {
  if (typeof message.content === "string") return message.content

  if (Array.isArray(message.content)) {
    return message.content
      .flatMap((part) => (typeof part?.text === "string" ? [part.text] : []))
      .join(" ")
      .trim()
  }

  if (message.content && typeof message.content === "object" && typeof message.content.text === "string") {
    return message.content.text
  }

  return ""
}

export function MessageSearchDialog({ open, onOpenChange, messages }: MessageSearchDialogProps) {
  const [searchKeyword, setSearchKeyword] = useState("")
  const normalizedKeyword = searchKeyword.trim().toLowerCase()

  const searchResults = useMemo(() => {
    if (!normalizedKeyword) return []

    return messages
      .map((message) => {
        const text = getMessageTextForSearch(message).trim()
        return { id: message.id, text, createdAt: message.createdAt }
      })
      .filter((message) => message.text.length > 0 && message.text.toLowerCase().includes(normalizedKeyword))
  }, [messages, normalizedKeyword]) satisfies MessageSearchResultItem[]

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen)
        if (!nextOpen) setSearchKeyword("")
      }}
    >
      <DialogContent className="top-1/2 flex h-[70vh] max-h-[70vh] -translate-y-1/2 flex-col gap-4 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Tìm kiếm tin nhắn</DialogTitle>
        </DialogHeader>

        <Input
          value={searchKeyword}
          onChange={(event) => setSearchKeyword(event.target.value)}
          placeholder="Nhập từ khóa..."
          autoFocus
        />

        <div className="min-h-0 flex-1 overflow-y-auto rounded-md border border-border/70">
          {normalizedKeyword.length === 0 ? (
            <p className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
              Nhập từ khóa để tìm nội dung tin nhắn
            </p>
          ) : searchResults.length === 0 ? (
            <p className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
              Không có kết quả phù hợp
            </p>
          ) : (
            <div className="divide-y divide-border/70">
              {searchResults.map((result) => (
                <div key={result.id} className="space-y-1 p-3">
                  <p className="line-clamp-2 text-sm text-foreground">{result.text}</p>
                  <p className="text-xs text-muted-foreground">{new Date(result.createdAt).toLocaleString("vi-VN")}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
