"use client"

import { Icons } from "@/components/global/icons"
import { useSendConversationMessage } from "@/hooks/use-messages"
import { useChatStore } from "@/stores/chat-store"
import { Button } from "@workspace/ui/components/button"
import Image from "next/image"
import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react"

export type ChatComposerProps = {
  onRequestScrollToBottom?: () => void
}

export function ChatComposer({ onRequestScrollToBottom }: ChatComposerProps) {
  const conversationId = useChatStore((s) => s.selectedConversation?.id ?? "")
  const { sendMessage, isPending } = useSendConversationMessage(conversationId)
  const [inputValue, setInputValue] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const previewItems = useMemo(() => {
    return files
      .map((file, index) => ({ file, index }))
      .map(({ file, index }) => {
        const isImage = file.type.startsWith("image/")
        const ext = file.name.includes(".") ? file.name.split(".").pop()?.toUpperCase() : "FILE"
        const lowerExt = (ext || "file").toLowerCase()
        const fileTone = (() => {
          if (lowerExt === "pdf") {
            return {
              bg: "bg-red-500/10",
              text: "text-red-600",
            }
          }
          if (["doc", "docx"].includes(lowerExt)) {
            return {
              bg: "bg-blue-500/10",
              text: "text-blue-600",
            }
          }
          if (["xls", "xlsx", "csv"].includes(lowerExt)) {
            return {
              bg: "bg-emerald-500/10",
              text: "text-emerald-600",
            }
          }
          if (["ppt", "pptx"].includes(lowerExt)) {
            return {
              bg: "bg-orange-500/10",
              text: "text-orange-600",
            }
          }
          return {
            bg: "bg-muted/60",
            text: "text-muted-foreground",
          }
        })()
        return {
          index,
          isImage,
          name: file.name,
          label: ext || "FILE",
          url: isImage ? URL.createObjectURL(file) : null,
          fileTone,
        }
      })
  }, [files])

  // Cleanup blob URLs when previews change/unmount
  useEffect(() => {
    return () => {
      for (const p of previewItems) {
        if (p.url) URL.revokeObjectURL(p.url)
      }
    }
  }, [previewItems])

  const handleSend = () => {
    const content = inputValue.trim()
    if (!conversationId) return
    if (!content) return
    onRequestScrollToBottom?.()
    console.log("[ChatComposer] send", {
      text: content,
      files,
    })
    sendMessage(content)
    setInputValue("")
    setFiles([])
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const isDisabled = !conversationId || !inputValue.trim() || isPending

  const handlePickFiles = () => {
    fileInputRef.current?.click()
  }

  const handleFilesSelected = (incoming: FileList | null) => {
    if (!incoming || incoming.length === 0) return
    setFiles((prev) => [...prev, ...Array.from(incoming)])
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleRemoveFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  return (
    <div className="border-t border-border bg-muted/50 px-2 py-2.5 sm:px-3 sm:py-3 md:p-4">
      <div className="flex w-full flex-col gap-2 rounded-xl border border-border bg-background p-2.5 transition-all duration-200 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 sm:p-3">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
          className="hidden"
          onChange={(e) => handleFilesSelected(e.target.files)}
        />

        {previewItems.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {previewItems.map((p) => (
              <div key={`${p.index}-${p.label}`} className="group relative h-16 w-16">
                <div className="relative h-full w-full overflow-hidden rounded-lg border border-border bg-muted/40">
                  {p.isImage && p.url ? (
                    <Image src={p.url} alt="Ảnh đính kèm" fill unoptimized className="object-cover" />
                  ) : (
                    <div
                      className={`flex h-full w-full items-center justify-center text-[10px] font-semibold ${p.fileTone.bg} ${p.fileTone.text}`}
                    >
                      {p.label}
                    </div>
                  )}
                  <div className="absolute right-0 bottom-0 left-0 bg-black/50 px-1 py-0.5">
                    <p className="truncate text-[9px] leading-none text-white">{p.name}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(p.index)}
                  className="absolute -top-1 -right-1 z-20 flex h-5 w-5 items-center justify-center rounded-full border border-red-300 bg-red-50 text-[10px] text-red-600 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:bg-red-100"
                  aria-label="Xóa tệp"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập tin nhắn"
          rows={2}
          className="max-h-40 min-h-[40px] w-full resize-y bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none sm:max-h-52"
        />

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-0.5 sm:gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={handlePickFiles}
            >
              <Icons.paperclip className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground" disabled>
              <Icons.smile className="size-4" />
            </Button>
          </div>

          <Button
            size="sm"
            onClick={handleSend}
            disabled={isDisabled}
            className="h-8 min-w-[74px] gap-1 px-3 sm:gap-1.5 sm:px-4"
          >
            <Icons.send className="size-3.5" />
            <span className="text-xs">Gửi</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
