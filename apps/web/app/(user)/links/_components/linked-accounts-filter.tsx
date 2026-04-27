"use client"

import { Button } from "@workspace/ui/components/button"
import type { ChannelType } from "@workspace/database"
import { Input } from "@workspace/ui/components/input"
import { Icons } from "@/components/global/icons"
import { channelMeta, getProviderLabel } from "@/lib/helper"

type LinkedAccountsFilterProps = {
  filter: {
    search: string
    provider: "all" | ChannelType
  }
  onFilterChange: (value: { search?: string; provider?: "all" | ChannelType }) => void
}

export function LinkedAccountsFilter({
  filter,
  onFilterChange,
}: LinkedAccountsFilterProps) {
  const providers = Object.keys(channelMeta)

  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 p-3.5 md:p-4">
      <div className="flex flex-col gap-3">
        <div className="relative w-full">
          <Icons.search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filter.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Tìm theo tên tài khoản, ID..."
            className="h-10 rounded-xl border-border/70 bg-background pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={filter.provider === "all" ? "default" : "outline"}
            className="rounded-full px-3"
            onClick={() => onFilterChange({ provider: "all" })}
          >
            Tất cả
          </Button>
          {providers.map((provider) => (
            <Button
              key={provider}
              type="button"
              size="sm"
              variant={filter.provider === provider ? "default" : "outline"}
              className="rounded-full px-3 capitalize"
              onClick={() => onFilterChange({ provider: provider as ChannelType })}
            >
              {getProviderLabel(provider)}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
