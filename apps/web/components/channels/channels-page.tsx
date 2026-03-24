"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Icons } from "../global/icons"
import SummaryStats from "./summary_stats"
import { AddConnectionDialog } from "./add-connection-dialog"
import ConnectedChannelSection from "./connected_channel_section"
import ConnectedChannelListSkeleton from "./connected_channel_list_skeleton"
import { useMutation, useQuery } from "@tanstack/react-query"
import { linkAccounts } from "@/api"
import { toast } from "@workspace/ui/components/sonner"

// Channel icons and colors
export const channelConfig = {
  zalo_oa: {
    icon: <Icons.zalo />,
    color: "from-blue-500 to-blue-600",
    bgLight: "bg-blue-50",
    borderActive: "border-blue-200",
    textColor: "text-blue-600",
  },
  zalo_personal: {
    icon: <Icons.zalo />,
    color: "from-blue-400 to-blue-500",
    bgLight: "bg-blue-50",
    borderActive: "border-blue-200",
    textColor: "text-blue-500",
  },
  facebook: {
    icon: <Icons.facebook />,
    color: "from-blue-500 to-purple-500",
    bgLight: "bg-gradient-to-br from-blue-50 to-purple-50",
    borderActive: "border-purple-200",
    textColor: "text-purple-600",
  },
  email: {
    icon: <Icons.gmail />,
    color: "from-slate-400 to-slate-500",
    bgLight: "bg-slate-50",
    borderActive: "border-slate-200",
    textColor: "text-slate-500",
  },
  phone: {
    icon: <Icons.phoneChannel />,
    color: "from-emerald-400 to-emerald-500",
    bgLight: "bg-emerald-50",
    borderActive: "border-emerald-200",
    textColor: "text-emerald-500",
  },
}

// Main component
export function ChannelsPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const {
    data: linkAccountsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["link-accounts"],
    queryFn: () => linkAccounts.getAll(),
  })

  const {
    mutateAsync: disconnectChannel,
    isPending: isDisconnecting,
    variables: disconnectingChannelId,
  } = useMutation({
    mutationKey: ["disconnect-channel"],
    mutationFn: (channelId: string) =>
      linkAccounts.update(channelId, {
        status: "inactive",
      }),
    onSuccess: () => {
      toast.success("Đã ngắt kết nối kênh thành công")
      refetch()
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi ngắt kết nối kênh")
    },
  })

  const {
    mutateAsync: reconnectChannel,
    isPending: isReconnecting,
    variables: reconnectingChannelId,
  } = useMutation({
    mutationKey: ["reconnect-channel"],
    mutationFn: (channelId: string) =>
      linkAccounts.update(channelId, {
        status: "active",
      }),
    onSuccess: () => {
      toast.success("Đã kết nối lại kênh thành công")
      refetch()
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi kết nối lại kênh")
    },
  })

  const {
    mutateAsync: deleteChannel,
    isPending: isDeleting,
    variables: deletingChannelId,
  } = useMutation({
    mutationKey: ["delete-channel"],
    mutationFn: (channelId: string) => linkAccounts.delete(channelId),
    onSuccess: () => {
      toast.success("Đã xoá liên kết kênh thành công")
      refetch()
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi xoá liên kết kênh")
    },
  })

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex shrink-0 flex-col gap-4 border-b border-border/50 bg-card/50 px-4 py-5 md:h-[64px] md:flex-row md:items-center md:justify-between md:gap-0 md:px-8 md:py-6 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground dark:text-zinc-100">Kênh kết nối</h1>
          <p className="mt-0.5 text-sm text-muted-foreground dark:text-zinc-500">Quản lý kết nối các kênh giao tiếp</p>
        </div>
        <Button
          className="w-full gap-2 bg-primary shadow-sm hover:bg-primary/90 md:w-auto dark:bg-primary/90 dark:hover:bg-primary/80"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Thêm kênh
        </Button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-background dark:bg-zinc-950">
        <div className="max-w-7xl p-4 md:p-8">
          {/* Summary stats */}
          <SummaryStats connectedChannels={linkAccountsData?.data?.items || []} />

          {/* Connected channels section */}
          {isLoading || !linkAccountsData || isDeleting || isDisconnecting || isReconnecting ? (
            <ConnectedChannelListSkeleton />
          ) : (
            <ConnectedChannelSection
              listChannels={linkAccountsData?.data?.items || []}
              onClickAddChannel={() => setDialogOpen(true)}
              onClickDisconnectChannel={disconnectChannel}
              onClickReconnectChannel={reconnectChannel}
              onClickDeleteChannel={deleteChannel}
              disconnectingChannelId={isDisconnecting ? disconnectingChannelId : null}
              reconnectingChannelId={isReconnecting ? reconnectingChannelId : null}
              deletingChannelId={isDeleting ? deletingChannelId : null}
            />
          )}
        </div>
      </div>

      <AddConnectionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
