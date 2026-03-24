"use client"

import { LinkAccount } from "@workspace/database"
import { Button } from "@workspace/ui/components/button"
import { useState } from "react"
import { Icons } from "../global/icons"
import DeleteLinkAccountDialog from "./delete-link-account-dialog"
import DisconnectLinkAccountDialog from "./disconnect-link-account-dialog"

type ChannelActionHandler = (channelId: string) => Promise<unknown> | void

interface ChannelCardActionsProps {
  channel: LinkAccount
  onClickDisconnect?: ChannelActionHandler
  onClickReconnect?: ChannelActionHandler
  onClickDelete?: ChannelActionHandler
  disconnectingChannelId?: string | null
  reconnectingChannelId?: string | null
  deletingChannelId?: string | null
}

const ChannelCardActions: React.FC<ChannelCardActionsProps> = ({
  channel,
  onClickDisconnect,
  onClickReconnect,
  onClickDelete,
  disconnectingChannelId,
  reconnectingChannelId,
  deletingChannelId,
}) => {
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const isDisconnecting = disconnectingChannelId === channel.id
  const isReconnecting = reconnectingChannelId === channel.id
  const isDeleting = deletingChannelId === channel.id
  const isBusy = isDisconnecting || isReconnecting || isDeleting

  const channelName = channel.displayName || channel.provider

  const handleDisconnect = async () => {
    if (!onClickDisconnect) return
    try {
      await onClickDisconnect(channel.id)
    } catch {
      // Toast is handled by the mutation owner.
    }
  }

  const handleReconnect = async () => {
    if (!onClickReconnect) return
    try {
      await onClickReconnect(channel.id)
    } catch {
      // Toast is handled by the mutation owner.
    }
  }

  const handleDelete = async () => {
    if (!onClickDelete) return
    try {
      await onClickDelete(channel.id)
    } catch {
      // Toast is handled by the mutation owner.
    }
  }

  return (
    <>
      <div className="flex flex-col gap-2 border-t border-border/50 pt-4 md:flex-row md:flex-wrap md:items-center md:gap-2 dark:border-zinc-700">
        {channel.status === "active" ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 md:min-w-[140px] md:flex-1 dark:border-zinc-700 dark:hover:bg-zinc-800"
            disabled={isBusy}
          >
            <Icons.refreshCw className="h-4 w-4" />
            Đăng nhập lại
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 md:min-w-[140px] md:flex-1 dark:border-zinc-700 dark:hover:bg-zinc-800"
            onClick={handleReconnect}
            disabled={isBusy}
          >
            {isReconnecting ? <Icons.spinner className="h-4 w-4 animate-spin" /> : <Icons.settings className="h-4 w-4" />}
            Kết nối lại
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="w-full gap-2 text-muted-foreground hover:text-destructive md:w-auto dark:text-zinc-400 dark:hover:text-red-400"
          onClick={() => setDisconnectDialogOpen(true)}
          disabled={channel.status !== "active" || isBusy}
        >
          <Icons.unplug className="h-4 w-4" />
          Ngắt kết nối
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full gap-2 text-destructive hover:text-destructive md:w-auto"
          onClick={() => setDeleteDialogOpen(true)}
          disabled={isBusy}
        >
          <Icons.trash className="h-4 w-4" />
          Xoá liên kết
        </Button>
      </div>

      <DisconnectLinkAccountDialog
        open={disconnectDialogOpen}
        onOpenChange={setDisconnectDialogOpen}
        channelName={channelName}
        onConfirm={handleDisconnect}
        isPending={isDisconnecting}
      />

      <DeleteLinkAccountDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        channelName={channelName}
        onConfirm={handleDelete}
        isPending={isDeleting}
      />
    </>
  )
}

export default ChannelCardActions
