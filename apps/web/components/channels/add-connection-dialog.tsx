"use client"

import Image from "next/image"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"
import { Icons } from "@/components/global/icons"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import MetaTabContents from "@/components/channels/facebook/meta_tab_contents"
import { isMetaOAuthAvailable } from "@/components/channels/facebook/meta_oauth"
import ZaloTabContents from "@/components/channels/zalo/zalo_tab_contents"
import { useState } from "react"

type ChannelId = "zalo" | "facebook" | "gmail" | "stringee"

interface AddConnectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ChannelOption {
  id: ChannelId
  name: string
  description: string
  icon: React.ReactNode
  available: boolean
  badge?: string
}

export function AddConnectionDialog({ open, onOpenChange }: AddConnectionDialogProps) {
  const [channelSearch, setChannelSearch] = useState("")
  const [selectedChannel, setSelectedChannel] = useState<ChannelId>("zalo")

  const channels: ChannelOption[] = [
    {
      id: "zalo",
      name: "Zalo",
      description: "Kết nối Zalo cá nhân hoặc Zalo OA",
      icon: <Image src={"/Zalo.png"} alt="Zalo" className="size-10 shrink-0 object-contain" width={40} height={40} />,
      available: true,
    },
    {
      id: "facebook",
      name: "Facebook",
      description: "Kết nối Facebook Page để quản lý tin nhắn Messenger",
      icon: (
        <Image
          src={"/Facebook.png"}
          alt="Facebook"
          className="size-10 shrink-0 object-contain"
          width={40}
          height={40}
        />
      ),
      available: isMetaOAuthAvailable(),
    },
    {
      id: "gmail",
      name: "Gmail",
      description: "Kết nối email hỗ trợ khách hàng",
      icon: <Image src={"/Gmail.png"} alt="Gmail" className="size-8 shrink-0 object-contain" width={40} height={40} />,
      available: false,
      badge: "Sắp ra mắt",
    },
    {
      id: "stringee",
      name: "Stringee",
      description: "Tích hợp tổng đài để tiếp nhận và quản lý cuộc gọi",
      icon: (
        <Image
          src={"/Stringee.png"}
          alt="Stringee"
          className="size-10 shrink-0 object-contain"
          width={40}
          height={40}
        />
      ),
      available: false,
      badge: "Sắp ra mắt",
    },
  ]

  const filteredChannels = channels.filter((channel) => {
    const keyword = channelSearch.trim().toLowerCase()
    if (!keyword) return true

    return `${channel.name} ${channel.description}`.toLowerCase().includes(keyword)
  })

  const activeChannelId =
    filteredChannels.some((channel) => channel.id === selectedChannel) || filteredChannels.length === 0
      ? selectedChannel
      : filteredChannels[0]?.id ?? selectedChannel

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setChannelSearch("")
      setSelectedChannel("zalo")
    }

    onOpenChange(nextOpen)
  }

  const renderRightPanel = () => {
    if (activeChannelId === "zalo") {
      return <ZaloTabContents open={open} />
    }

    if (activeChannelId === "facebook") {
      return <MetaTabContents />
    }

    if (activeChannelId === "gmail") {
      return (
        <div className="flex h-full items-center justify-center rounded-2xl border bg-background/90 p-8 text-center shadow-sm">
          <div className="max-w-md space-y-4">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-rose-50 text-rose-500 dark:bg-rose-950/40 dark:text-rose-300">
              <Icons.mail className="size-7" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">Kết nối Gmail đang được chuẩn bị</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Giao diện đã sẵn sàng cho luồng kết nối. Khi backend hoàn thiện, khu vực này sẽ hiển thị nút chuyển tới
                trang ủy quyền Gmail.
              </p>
            </div>
            <Button type="button" variant="outline" disabled className="gap-2">
              <Icons.clock className="size-4" />
              Sắp ra mắt
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="flex h-full items-center justify-center rounded-2xl border bg-background/90 p-8 text-center shadow-sm">
        <div className="max-w-md space-y-4">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-300">
            <Image
              src={"/Stringee.png"}
              alt="Stringee"
              className="size-10 shrink-0 object-contain"
              width={40}
              height={40}
            />
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">Kết nối Stringee đang được chuẩn bị</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Khu vực này sẽ dùng để chuyển tới luồng ủy quyền tổng đài Stringee khi tích hợp hoàn tất.
            </p>
          </div>
          <Button type="button" variant="outline" disabled className="gap-2">
            <Icons.clock className="size-4" />
            Sắp ra mắt
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-h-[90dvh] gap-0 overflow-hidden p-0 sm:max-w-5xl">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Thêm kênh kết nối</DialogTitle>
          <DialogDescription>Chọn kênh bạn muốn kết nối với hệ thống</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90dvh-120px)]">
          <div className="border-t px-6 py-6">
            <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
              <div className="flex flex-col gap-2">
                <div className="rounded-2xl border bg-background/90 p-3 shadow-sm">
                  <div className="relative">
                    <Icons.search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={channelSearch}
                      onChange={(event) => setChannelSearch(event.target.value)}
                      placeholder="Tìm kênh cần kết nối"
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 rounded-2xl border bg-muted/10 p-2 shadow-sm">
                  {filteredChannels.length > 0 ? (
                    filteredChannels.map((channel) => {
                      const isSelected = channel.id === activeChannelId

                      return (
                        <button
                          key={channel.id}
                          type="button"
                          onClick={() => setSelectedChannel(channel.id)}
                          className={cn(
                            "flex items-start gap-3 rounded-xl border p-3 text-left transition-all",
                            isSelected
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-transparent bg-background/70 hover:border-border hover:bg-background"
                          )}
                        >
                          <div className="flex size-12 items-center justify-center rounded-xl bg-muted/40">
                            {channel.icon}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate font-medium text-foreground">{channel.name}</p>
                              {channel.badge ? (
                                <Badge variant="secondary" className="px-2 py-0 text-[10px]">
                                  {channel.badge}
                                </Badge>
                              ) : null}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">{channel.description}</p>
                          </div>

                          <div className="pt-1">
                            {isSelected ? (
                              <Icons.checkCircle2 className="size-5 text-primary" />
                            ) : (
                              <Icons.chevronRight className="size-5 text-muted-foreground" />
                            )}
                          </div>
                        </button>
                      )
                    })
                  ) : (
                    <div className="rounded-xl border border-dashed bg-background/70 p-6 text-center">
                      <Icons.search className="mx-auto size-5 text-muted-foreground" />
                      <p className="mt-3 text-sm font-medium text-foreground">Không tìm thấy kênh phù hợp</p>
                      <p className="mt-1 text-sm text-muted-foreground">Thử từ khóa khác để lọc danh sách kênh.</p>
                    </div>
                  )}
                </div>
              </div>

              <div
                className={cn(
                  "rounded-2xl border bg-muted/10 p-4 shadow-sm",
                  activeChannelId === "facebook" && "bg-background/90 p-6"
                )}
              >
                {renderRightPanel()}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
