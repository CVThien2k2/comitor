"use client"

import { Icons } from "@/components/global/icons"
import { channelMeta } from "@/lib/helper"
import Meta from "@/app/(user)/links/_components/add-connection/meta"
import ZaloOa from "@/app/(user)/links/_components/add-connection/zalo-oa"
import Zalo from "@/app/(user)/links/_components/add-connection/zalo"
import type { ChannelType } from "@workspace/database"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Separator } from "@workspace/ui/components/separator"
import { cn } from "@workspace/ui/lib/utils"
import Image from "next/image"
import { useState, type ComponentType } from "react"

interface AddConnectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const channelOrder: ChannelType[] = ["zalo_oa", "zalo_personal", "facebook"]

const channelDescriptions: Record<ChannelType, string> = {
  zalo_oa: "Tài khoản cho doanh nghiệp",
  zalo_personal: "Tài khoản cá nhân",
  facebook: "Tài khoản cá nhân quản lý Fanpage",
}

type MobileStep = "list" | "detail"

const channelContentMap: Record<ChannelType, ComponentType> = {
  zalo_oa: ZaloOa,
  zalo_personal: Zalo,
  facebook: Meta,
}

interface PlatformListProps {
  channelOrder: ChannelType[]
  selectedChannel: ChannelType
  channelDescriptions: Record<ChannelType, string>
  onSelectChannel: (channel: ChannelType) => void
}

function PlatformList({ channelOrder, selectedChannel, channelDescriptions, onSelectChannel }: PlatformListProps) {
  return (
    <ScrollArea className="h-[calc(90dvh-9rem)]">
      <div className="space-y-3 px-1 py-1">
        {channelOrder.map((channel) => {
          const meta = channelMeta[channel]
          const isSelected = channel === selectedChannel

          return (
            <Card
              key={channel}
              size="sm"
              role="button"
              tabIndex={0}
              onClick={() => onSelectChannel(channel)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  onSelectChannel(channel)
                }
              }}
              className={cn(
                "group relative h-24 cursor-pointer gap-0 rounded-2xl border bg-background py-0 ring-0 transition-[transform,box-shadow,border-color,background-color] duration-300 ease-out before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-primary/70 before:opacity-0 before:transition-opacity before:duration-300 after:pointer-events-none after:absolute after:inset-y-0 after:left-0 after:w-1 after:scale-y-75 after:rounded-l-2xl after:bg-primary after:opacity-0 after:transition-[opacity,transform] after:duration-300",
                isSelected
                  ? "border-primary bg-primary/3 shadow-sm before:opacity-100 after:scale-y-100 after:opacity-100"
                  : "border-border hover:-translate-y-px hover:border-primary/40 hover:bg-muted/20 hover:shadow-md"
              )}
            >
              <CardContent className="flex h-full items-start gap-3 px-4 py-3">
                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl border transition-[border-color,background-color,transform] duration-300 ease-out",
                    isSelected
                      ? "scale-[1.03] border-primary/20 bg-primary/5"
                      : "border-border/60 bg-background group-hover:scale-[1.02] group-hover:border-primary/20 group-hover:bg-muted/40"
                  )}
                >
                  <Image src={meta.iconSrc} alt={meta.label} width={22} height={22} className="object-contain" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p
                      className={cn(
                        "truncate text-sm font-medium transition-[color,transform] duration-300 ease-out",
                        isSelected ? "translate-x-0.5 text-foreground" : "group-hover:text-foreground"
                      )}
                    >
                      {meta.label}
                    </p>
                    {isSelected ? (
                      <Badge
                        variant="secondary"
                        className="animate-in rounded-full px-2 text-[10px] duration-200 fade-in-0 slide-in-from-left-1"
                      >
                        Đang chọn
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground transition-colors duration-300 group-hover:text-muted-foreground/90">
                    {channelDescriptions[channel]}
                  </p>
                </div>

                <div
                  className={cn(
                    "pt-1 text-muted-foreground transition-[transform,color,opacity] duration-300 ease-out",
                    isSelected
                      ? "translate-x-0 text-primary opacity-100"
                      : "opacity-70 group-hover:translate-x-0.5 group-hover:opacity-100"
                  )}
                >
                  {isSelected ? (
                    <Icons.checkCircle2 className="size-5 animate-in duration-200 fade-in-0 zoom-in-95" />
                  ) : (
                    <Icons.chevronRight className="size-4" />
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </ScrollArea>
  )
}

export function AddConnectionDialog({ open, onOpenChange }: AddConnectionDialogProps) {
  const [selectedChannel, setSelectedChannel] = useState<ChannelType>("zalo_oa")
  const [mobileStep, setMobileStep] = useState<MobileStep>("list")
  const SelectedContent = channelContentMap[selectedChannel]

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSelectedChannel("zalo_oa")
      setMobileStep("list")
    }

    onOpenChange(nextOpen)
  }

  const handleSelectChannel = (channel: ChannelType) => {
    setSelectedChannel(channel)
    setMobileStep("detail")
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-h-[90dvh] gap-0 overflow-hidden p-0 sm:max-w-5xl">
        <DialogHeader className="border-b px-6 pt-6 pb-4">
          <DialogTitle>Tích hợp nền tảng</DialogTitle>
          <DialogDescription>Chọn nền tảng bạn muốn kết nối vào hệ thống.</DialogDescription>
        </DialogHeader>

        <div className="grid min-h-[520px] grid-cols-1 overflow-hidden sm:grid-cols-[320px_minmax(0,1fr)]">
          <aside
            className={cn(
              "border-b bg-muted/20 p-4 transition-transform duration-300 ease-out sm:border-r sm:border-b-0",
              mobileStep === "detail" ? "max-sm:-translate-x-full" : "max-sm:translate-x-0"
            )}
          >
            <div className="mb-4 flex items-center justify-between px-2">
              <p className="font-medium text-muted-foreground">Nền tảng</p>
              <Badge variant="outline" className="rounded-full px-2 text-[11px]">
                {channelOrder.length}
              </Badge>
            </div>

            <PlatformList
              channelOrder={channelOrder}
              selectedChannel={selectedChannel}
              channelDescriptions={channelDescriptions}
              onSelectChannel={handleSelectChannel}
            />
          </aside>

          <div
            className={cn(
              "bg-background p-0 transition-transform duration-300 ease-out max-sm:absolute max-sm:inset-0 max-sm:z-10 sm:p-6",
              mobileStep === "detail" ? "max-sm:translate-x-0" : "max-sm:translate-x-full"
            )}
          >
            <div className="flex h-full min-h-[320px] flex-col rounded-3xl border border-dashed border-border bg-muted/10 shadow-inner">
              <div
                key={selectedChannel}
                className="flex h-full animate-in flex-col duration-200 fade-in-0 slide-in-from-right-1"
              >
                <div className="flex items-center justify-between px-6 pt-6">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setMobileStep("list")}
                      className="flex size-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-muted sm:hidden"
                    >
                      <Icons.chevronRight className="size-4 rotate-180" />
                    </button>

                    <div className="flex size-11 items-center justify-center rounded-2xl border border-border bg-background">
                      <Image
                        src={channelMeta[selectedChannel].iconSrc}
                        alt={channelMeta[selectedChannel].label}
                        width={22}
                        height={22}
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{channelMeta[selectedChannel].label}</p>
                      <p className="text-xs text-muted-foreground">{channelDescriptions[selectedChannel]}</p>
                    </div>
                  </div>
                </div>

                <Separator className="mt-5" />

                <div className="flex-1 overflow-y-auto p-6">
                  <SelectedContent />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
