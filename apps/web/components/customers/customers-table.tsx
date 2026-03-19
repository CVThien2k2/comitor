"use client"

import * as React from "react"
import { Icons } from "@/components/global/icons"
import { cn } from "@workspace/ui/lib/utils"  
import { Input } from "@workspace/ui/components/input"  
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

// Channel icons
const ZaloIcon = () => (
  <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 17.785c-.066.037-.273.15-.493.15-.266 0-.463-.135-.59-.405l-1.477-3.13h-5.74l-.003.007-1.46 3.104c-.13.277-.335.424-.612.424-.213 0-.42-.108-.488-.147-.332-.188-.535-.543-.535-.947 0-.16.04-.324.122-.5l4.47-9.297c.174-.36.5-.58.88-.58.382 0 .71.22.884.583l4.47 9.294c.082.176.123.34.123.5 0 .404-.202.76-.551.944zM12 6.82l-2.238 4.643h4.476L12 6.82z"/>
  </svg>
)

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

const WebsiteIcon = () => (
  <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
)

// Types
export type CustomerTier = "gold" | "silver" | "bronze"
export type CustomerState = "active" | "at_risk" | "new" | "churned" | "inactive"
export type CustomerChannel = "zalo" | "facebook" | "website"

export interface CustomerBooking {
  code: string
  route: string
  date: string
  status: "upcoming" | "completed" | "cancelled"
}

export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  avatarColor: string
  tier: CustomerTier
  state: CustomerState
  channels: CustomerChannel[]
  conversationCount: number
  lastBooking?: CustomerBooking
  lastUpdated: string
  organization?: string
  totalSpent?: number
}

interface CustomersTableProps {
  customers: Customer[]
  selectedId: string | null
  onSelect: (customer: Customer) => void
}

const channelConfig = {
  zalo: { icon: ZaloIcon, color: "text-blue-500", bg: "bg-blue-50", name: "Zalo" },
  facebook: { icon: FacebookIcon, color: "text-blue-600", bg: "bg-blue-50", name: "Facebook" },
  website: { icon: WebsiteIcon, color: "text-emerald-600", bg: "bg-emerald-50", name: "Website" },
}

const tierConfig = {
  gold: { label: "Vàng", color: "bg-amber-100 text-amber-700 border-amber-200" },
  silver: { label: "Bạc", color: "bg-slate-100 text-slate-600 border-slate-300" },
  bronze: { label: "Đồng", color: "bg-orange-100 text-orange-700 border-orange-200" },
}

const stateConfig = {
  active: { label: "Hoạt động", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  at_risk: { label: "Có rủi ro", color: "bg-amber-100 text-amber-700 border-amber-200" },
  new: { label: "Mới", color: "bg-blue-100 text-blue-700 border-blue-200" },
  churned: { label: "Đã rời", color: "bg-red-100 text-red-700 border-red-200" },
  inactive: { label: "Không hoạt động", color: "bg-slate-100 text-slate-500 border-slate-200" },
}

const bookingStatusConfig = {
  upcoming: { label: "Sắp tới", color: "text-blue-600" },
  completed: { label: "Hoàn thành", color: "text-emerald-600" },
  cancelled: { label: "Đã hủy", color: "text-red-500" },
}

function FilterDropdown({ 
  label, 
  options, 
  value, 
  onChange 
}: { 
  label: string
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}) {
  const selectedOption = options.find(o => o.value === value)
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 gap-1.5 text-xs font-normal border-border/70 hover:bg-muted/50"
        >
          <span className="text-muted-foreground">{label}:</span>
          <span className="font-medium">{selectedOption?.label || "Tất cả"}</span>
          <Icons.chevronDown className="size-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[140px]">
        {options.map((option) => (
          <DropdownMenuItem 
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn("text-sm", value === option.value && "bg-accent")}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function CustomerRow({ 
  customer, 
  isSelected, 
  onClick 
}: { 
  customer: Customer
  isSelected: boolean
  onClick: () => void
}) {
  const initials = customer.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const tier = tierConfig[customer.tier]
  const state = stateConfig[customer.state]

  return (
    <tr
      onClick={onClick}
      className={cn(
        "group cursor-pointer border-b border-border/50 transition-colors duration-150",
        isSelected 
          ? "bg-primary/[0.06] hover:bg-primary/[0.08]" 
          : "hover:bg-muted/50"
      )}
    >
      {/* Customer Info */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            <AvatarFallback 
              className="text-xs font-semibold text-white"
              style={{ backgroundColor: customer.avatarColor }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-medium text-sm text-foreground truncate">{customer.name}</p>
            <p className="text-xs text-muted-foreground truncate">{customer.email}</p>
          </div>
        </div>
      </td>

      {/* Tier */}
      <td className="py-3 px-4">
        <Badge variant="outline" className={cn("text-[10px] font-medium h-5", tier.color)}>
          {tier.label}
        </Badge>
      </td>

      {/* State */}
      <td className="py-3 px-4">
        <Badge variant="outline" className={cn("text-[10px] font-medium h-5", state.color)}>
          {state.label}
        </Badge>
      </td>

      {/* Channels */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-1">
          {customer.channels.map((channel) => {
            const config = channelConfig[channel]
            const Icon = config.icon
            return (
              <span
                key={channel}
                className={cn(
                  "size-6 rounded-full flex items-center justify-center",
                  config.bg,
                  config.color
                )}
                title={config.name}
              >
                <Icon />
              </span>
            )
          })}
        </div>
      </td>

      {/* Conversations */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Icons.messageSquare className="size-3.5" />
          <span>{customer.conversationCount}</span>
        </div>
      </td>

      {/* Last Booking */}
      <td className="py-3 px-4">
        {customer.lastBooking ? (
          <div className="flex items-center gap-2">
            <Icons.plane className="size-3.5 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground truncate">
                {customer.lastBooking.code}
              </p>
              <p className={cn(
                "text-[10px]", 
                bookingStatusConfig[customer.lastBooking.status].color
              )}>
                {customer.lastBooking.route} • {bookingStatusConfig[customer.lastBooking.status].label}
              </p>
            </div>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )}
      </td>

      {/* Last Updated */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Icons.calendar className="size-3" />
          <span>{customer.lastUpdated}</span>
        </div>
      </td>

      {/* Actions */}
      <td className="py-3 px-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon-sm" 
              className="size-7 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <Icons.moreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
            <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
            <DropdownMenuItem>Gửi tin nhắn</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Xóa</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  )
}

export function CustomersTable({ customers, selectedId, onSelect }: CustomersTableProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [tierFilter, setTierFilter] = React.useState("all")
  const [stateFilter, setStateFilter] = React.useState("all")
  const [channelFilter, setChannelFilter] = React.useState("all")
  const [sortBy, setSortBy] = React.useState("recent")

  const tierOptions = [
    { value: "all", label: "Tất cả" },
    { value: "gold", label: "Vàng" },
    { value: "silver", label: "Bạc" },
    { value: "bronze", label: "Đồng" },
  ]

  const stateOptions = [
    { value: "all", label: "Tất cả" },
    { value: "active", label: "Hoạt động" },
    { value: "at_risk", label: "Có rủi ro" },
    { value: "new", label: "Mới" },
    { value: "churned", label: "Đã rời" },
    { value: "inactive", label: "Không hoạt động" },
  ]

  const channelOptions = [
    { value: "all", label: "Tất cả" },
    { value: "zalo", label: "Zalo" },
    { value: "facebook", label: "Facebook" },
    { value: "website", label: "Website" },
  ]

  const sortOptions = [
    { value: "recent", label: "Gần đây nhất" },
    { value: "name", label: "Tên A-Z" },
    { value: "conversations", label: "Nhiều hội thoại" },
    { value: "tier", label: "Theo hạng" },
  ]

  const filteredCustomers = React.useMemo(() => {
    let filtered = customers

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query) ||
          c.organization?.toLowerCase().includes(query)
      )
    }

    // Tier filter
    if (tierFilter !== "all") {
      filtered = filtered.filter((c) => c.tier === tierFilter)
    }

    // State filter
    if (stateFilter !== "all") {
      filtered = filtered.filter((c) => c.state === stateFilter)
    }

    // Channel filter
    if (channelFilter !== "all") {
      filtered = filtered.filter((c) => c.channels.includes(channelFilter as CustomerChannel))
    }

    // Sort
    if (sortBy === "name") {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === "conversations") {
      filtered = [...filtered].sort((a, b) => b.conversationCount - a.conversationCount)
    } else if (sortBy === "tier") {
      const tierOrder = { gold: 0, silver: 1, bronze: 2 }
      filtered = [...filtered].sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier])
    }

    return filtered
  }, [customers, searchQuery, tierFilter, stateFilter, channelFilter, sortBy])

  return (
    <div className="flex flex-col h-full">
      {/* Filters Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px] max-w-[360px]">
          <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm khách hàng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-muted/40 border-border/70 focus-visible:border-primary/50"
          />
        </div>

        {/* Filter Dropdowns */}
        <FilterDropdown 
          label="Hạng" 
          options={tierOptions} 
          value={tierFilter} 
          onChange={setTierFilter} 
        />
        <FilterDropdown 
          label="Trạng thái" 
          options={stateOptions} 
          value={stateFilter} 
          onChange={setStateFilter} 
        />
        <FilterDropdown 
          label="Kênh" 
          options={channelOptions} 
          value={channelFilter} 
          onChange={setChannelFilter} 
        />
        <FilterDropdown 
          label="Sắp xếp" 
          options={sortOptions} 
          value={sortBy} 
          onChange={setSortBy} 
        />
      </div>

      {/* Table */}
      <div className="flex-1 mt-4 overflow-auto rounded-lg border border-border bg-card">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Khách hàng
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Hạng
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Trạng thái
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Kênh
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Hội thoại
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Booking gần nhất
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Cập nhật
              </th>
              <th className="py-3 px-4 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center">
                  <div className="flex flex-col items-center text-muted-foreground">
                    <Icons.users className="size-10 mb-3 opacity-40" />
                    <p className="text-sm font-medium">Không tìm thấy khách hàng</p>
                    <p className="text-xs mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer) => (
                <CustomerRow
                  key={customer.id}
                  customer={customer}
                  isSelected={selectedId === customer.id}
                  onClick={() => onSelect(customer)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
        <span>
          Hiển thị {filteredCustomers.length} / {customers.length} khách hàng
        </span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-amber-400" />
            {customers.filter(c => c.tier === "gold").length} Vàng
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-slate-400" />
            {customers.filter(c => c.tier === "silver").length} Bạc
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-orange-400" />
            {customers.filter(c => c.tier === "bronze").length} Đồng
          </span>
        </div>
      </div>
    </div>
  )
}
