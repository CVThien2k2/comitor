"use client"

import { Icons } from "@/components/global/icons"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { cn } from "@workspace/ui/lib/utils"

type MessageActionsProps = {
  isCustomer: boolean
  content?: unknown
}

function getMessageTextContent(content: unknown): string {
  if (!content) return ""
  if (typeof content === "string") return content.trim()

  if (Array.isArray(content)) {
    const textParts = content
      .map((part) => {
        if (!part || typeof part !== "object") return ""
        const maybeText = (part as { text?: unknown }).text
        return typeof maybeText === "string" ? maybeText.trim() : ""
      })
      .filter(Boolean)
    return textParts.join(" ").trim()
  }

  if (typeof content === "object") {
    const maybeText = (content as { text?: unknown }).text
    return typeof maybeText === "string" ? maybeText.trim() : ""
  }

  return ""
}

export function MessageActions({ isCustomer, content }: MessageActionsProps) {
  const contentText = getMessageTextContent(content)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-xs"
          className={cn(
            "size-6 shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-foreground",
            "group-hover/msg:opacity-100 data-[state=open]:opacity-100"
          )}
        >
          <Icons.moreHorizontal className="size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isCustomer ? "start" : "end"} className="min-w-36">
        {contentText && (
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(contentText)}>
            <Icons.copy className="mr-2 size-4" />
            Sao chép
          </DropdownMenuItem>
        )}
        <DropdownMenuItem className="text-destructive focus:text-destructive">
          <Icons.trash className="mr-2 size-4" />
          Xóa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
