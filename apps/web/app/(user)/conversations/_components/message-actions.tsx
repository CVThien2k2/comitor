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
  content?: string | null
}

export function MessageActions({ isCustomer, content }: MessageActionsProps) {
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
        {content && (
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(content)}>
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
