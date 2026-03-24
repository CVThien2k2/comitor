"use client"

import { LinkAccount } from "@workspace/database"
import { Badge } from "@workspace/ui/components/badge"
import { Icons } from "../global/icons"
import { channelConfig } from "./channels-page"
import ConnectedChannelCard from "./connected_channel_card"
import { Button } from "@workspace/ui/components/button"
import { Plus } from "lucide-react"

type ChannelActionHandler = (channelId: string) => Promise<unknown> | void

interface IProps {
  listChannels: LinkAccount[]
  onClickAddChannel?: () => void
  onClickDisconnectChannel?: ChannelActionHandler
  onClickReconnectChannel?: ChannelActionHandler
  onClickDeleteChannel?: ChannelActionHandler
  disconnectingChannelId?: string | null
  reconnectingChannelId?: string | null
  deletingChannelId?: string | null
}

const ConnectedChannelSection: React.FC<IProps> = ({
  listChannels,
  onClickAddChannel,
  onClickDisconnectChannel,
  onClickReconnectChannel,
  onClickDeleteChannel,
  disconnectingChannelId,
  reconnectingChannelId,
  deletingChannelId,
}) => {
  return (
    <div className="mb-10 rounded-2xl border bg-background/90 p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
          <Icons.checkCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-lg font-semibold text-foreground dark:text-zinc-100">Đã kết nối</h2>
        <Badge variant="secondary" className="ml-1 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          {listChannels.length} kênh
        </Badge>
      </div>
      {!listChannels ||
        (listChannels.length === 0 && (
          <div className="flex h-[30vh] flex-col items-center justify-center gap-4 text-sm text-muted-foreground dark:text-zinc-500">
            <p>Chưa có kênh nào được kết nối.</p>
            <Button
              className="gap-2 bg-primary shadow-sm hover:bg-primary/90 md:w-auto dark:bg-primary/90 dark:hover:bg-primary/80"
              onClick={onClickAddChannel}
            >
              <Plus className="h-4 w-4" />
              Thêm kênh
            </Button>
          </div>
        ))}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {listChannels.length > 0 &&
          listChannels.map((channel) => (
            <ConnectedChannelCard
              key={channel.id}
              channel={channel}
              channelConfig={channelConfig}
              onClickDisconnect={onClickDisconnectChannel}
              onClickReconnect={onClickReconnectChannel}
              onClickDelete={onClickDeleteChannel}
              disconnectingChannelId={disconnectingChannelId}
              reconnectingChannelId={reconnectingChannelId}
              deletingChannelId={deletingChannelId}
            />
          ))}
      </div>
    </div>
  )
}

export default ConnectedChannelSection
