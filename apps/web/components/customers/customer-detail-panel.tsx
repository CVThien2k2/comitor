"use client"

import * as React from "react"
import { Icons } from "@/components/global/icons"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import type { Customer, CustomerChannel } from "./customers-table"

// Channel icons
const ZaloIcon = () => (
  <svg viewBox="0 0 24 24" className="size-4" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 17.785c-.066.037-.273.15-.493.15-.266 0-.463-.135-.59-.405l-1.477-3.13h-5.74l-.003.007-1.46 3.104c-.13.277-.335.424-.612.424-.213 0-.42-.108-.488-.147-.332-.188-.535-.543-.535-.947 0-.16.04-.324.122-.5l4.47-9.297c.174-.36.5-.58.88-.58.382 0 .71.22.884.583l4.47 9.294c.082.176.123.34.123.5 0 .404-.202.76-.551.944zM12 6.82l-2.238 4.643h4.476L12 6.82z"/>
  </svg>
)

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="size-4" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

const WebsiteIcon = () => (
  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
)

// Extended customer details type
export interface CustomerDetails extends Customer {
  loyaltyPoints?: number
  dateOfBirth?: string
  preferredAirline?: string
  paymentMethod?: string
  linkedIdentities?: {
    channel: CustomerChannel
    identifier: string
    verified: boolean
  }[]
  bookingHistory?: {
    code: string
    route: string
    date: string
    status: "upcoming" | "completed" | "cancelled"
    price?: string
  }[]
  recentActivity?: {
    type: "message" | "booking" | "call" | "note"
    description: string
    timestamp: string
  }[]
  internalNotes?: {
    id: string
    content: string
    author: string
    timestamp: string
  }[]
}

interface CustomerDetailPanelProps {
  customer: CustomerDetails
  onClose: () => void
  onEdit?: () => void
  onMessage?: () => void
}

const tierConfig = {
  gold: { label: "Hạng Vàng", color: "bg-gradient-to-r from-amber-400 to-amber-500 text-white", icon: "bg-amber-100 text-amber-600" },
  silver: { label: "Hạng Bạc", color: "bg-gradient-to-r from-slate-400 to-slate-500 text-white", icon: "bg-slate-100 text-slate-600" },
  bronze: { label: "Hạng Đồng", color: "bg-gradient-to-r from-orange-400 to-orange-500 text-white", icon: "bg-orange-100 text-orange-600" },
}

const stateConfig = {
  active: { label: "Hoạt động", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  at_risk: { label: "Có rủi ro", color: "bg-amber-100 text-amber-700 border-amber-200" },
  new: { label: "Mới", color: "bg-blue-100 text-blue-700 border-blue-200" },
  churned: { label: "Đã rời", color: "bg-red-100 text-red-700 border-red-200" },
  inactive: { label: "Không hoạt động", color: "bg-slate-100 text-slate-500 border-slate-200" },
}

const channelConfig = {
  zalo: { icon: ZaloIcon, color: "text-blue-500", bg: "bg-blue-50", name: "Zalo" },
  facebook: { icon: FacebookIcon, color: "text-blue-600", bg: "bg-blue-50", name: "Facebook" },
  website: { icon: WebsiteIcon, color: "text-emerald-600", bg: "bg-emerald-50", name: "Website" },
}

const bookingStatusConfig = {
  upcoming: { label: "Sắp tới", color: "bg-blue-100 text-blue-700" },
  completed: { label: "Hoàn thành", color: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-600" },
}

const activityIcons = {
  message: Icons.messageSquare,
  booking: Icons.plane,
  call: Icons.phone,
  note: Icons.fileText,
}

function Section({ 
  title, 
  icon: Icon, 
  children,
  action,
  collapsible = false,
  defaultOpen = true
}: { 
  title: string
  icon: React.ElementType
  children: React.ReactNode
  action?: React.ReactNode
  collapsible?: boolean
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  const headerContent = (
    <>
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-muted-foreground" />
        <h4 className="text-sm font-medium text-foreground">{title}</h4>
      </div>
      <div className="flex items-center gap-2">
        {action && <span onClick={(e) => e.stopPropagation()}>{action}</span>}
        {collapsible && (
          <Icons.chevronRight className={cn(
            "size-4 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-90"
          )} />
        )}
      </div>
    </>
  )

  return (
    <div className="border-b border-border/70 last:border-b-0">
      {collapsible ? (
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between py-3 px-5 cursor-pointer hover:bg-muted/30 transition-colors"
        >
          {headerContent}
        </button>
      ) : (
        <div className="w-full flex items-center justify-between py-3 px-5">
          {headerContent}
        </div>
      )}
      {(!collapsible || isOpen) && (
        <div className="px-5 pb-4">{children}</div>
      )}
    </div>
  )
}

function InfoItem({ 
  icon: Icon, 
  label, 
  value,
  className
}: { 
  icon: React.ElementType
  label: string
  value?: string | React.ReactNode
  className?: string
}) {
  if (!value) return null
  
  return (
    <div className={cn("flex items-start gap-3 py-2", className)}>
      <Icon className="size-4 text-muted-foreground shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
        <div className="text-sm text-foreground">{value}</div>
      </div>
    </div>
  )
}

export function CustomerDetailPanel({ customer, onClose, onEdit, onMessage }: CustomerDetailPanelProps) {
  const initials = customer.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const tier = tierConfig[customer.tier]
  const state = stateConfig[customer.state]

  return (
    <div className="flex flex-col h-full bg-background border-l border-border w-[480px] shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Chi tiết khách hàng</h3>
        <Button variant="ghost" size="icon-sm" onClick={onClose}>
          <Icons.x className="size-4" />
        </Button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Profile Header */}
        <div className="p-5 border-b border-border/70 bg-gradient-to-br from-muted/30 to-transparent">
          <div className="flex items-start gap-4">
            <Avatar className="size-16 ring-2 ring-background shadow-md">
              <AvatarFallback 
                className="text-xl font-bold text-white"
                style={{ backgroundColor: customer.avatarColor }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-foreground">{customer.name}</h2>
              {customer.organization && (
                <p className="text-sm text-muted-foreground mt-0.5">{customer.organization}</p>
              )}
              
              {/* Badges */}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <Badge className={cn("text-xs h-6 px-2.5 font-medium border-0", tier.color)}>
                  {tier.label}
                </Badge>
                <Badge variant="outline" className={cn("text-xs h-6", state.color)}>
                  {state.label}
                </Badge>
              </div>
            </div>

            <Button variant="ghost" size="icon-sm" onClick={onEdit}>
              <Icons.edit className="size-4" />
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-6 mt-5 pt-4 border-t border-border/50">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{customer.conversationCount}</p>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Hội thoại</p>
            </div>
            {customer.loyaltyPoints !== undefined && (
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{customer.loyaltyPoints.toLocaleString()}</p>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Điểm tích lũy</p>
              </div>
            )}
            {customer.totalSpent !== undefined && (
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{(customer.totalSpent / 1000000).toFixed(1)}M</p>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Chi tiêu (VNĐ)</p>
              </div>
            )}
          </div>
        </div>

        {/* Linked Identities */}
        {customer.linkedIdentities && customer.linkedIdentities.length > 0 && (
          <Section title="Danh tính liên kết" icon={Icons.globe}>
            <div className="space-y-2">
              {customer.linkedIdentities.map((identity, idx) => {
                const config = channelConfig[identity.channel]
                const Icon = config.icon
                return (
                  <div 
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border/50"
                  >
                    <span className={cn(
                      "size-8 rounded-full flex items-center justify-center",
                      config.bg,
                      config.color
                    )}>
                      <Icon />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{config.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{identity.identifier}</p>
                    </div>
                    {identity.verified && (
                      <Icons.checkCircle2 className="size-4 text-emerald-500" />
                    )}
                  </div>
                )
              })}
            </div>
          </Section>
        )}

        {/* Contact & Attributes */}
        <Section title="Thông tin & Thuộc tính" icon={Icons.user}>
          <div className="space-y-1">
            <InfoItem icon={Icons.mail} label="Email" value={customer.email} />
            <InfoItem icon={Icons.phone} label="Điện thoại" value={customer.phone} />
            {customer.dateOfBirth && (
              <InfoItem icon={Icons.calendar} label="Ngày sinh" value={customer.dateOfBirth} />
            )}
            {customer.preferredAirline && (
              <InfoItem icon={Icons.plane} label="Hãng bay ưa thích" value={customer.preferredAirline} />
            )}
            {customer.paymentMethod && (
              <InfoItem icon={Icons.creditCard} label="Phương thức thanh toán" value={customer.paymentMethod} />
            )}
          </div>
        </Section>

        {/* Booking History */}
        {customer.bookingHistory && customer.bookingHistory.length > 0 && (
          <Section title="Lịch sử Booking" icon={Icons.plane} collapsible defaultOpen>
            <div className="space-y-2">
              {customer.bookingHistory.map((booking, idx) => (
                <div 
                  key={idx}
                  className="group flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-border hover:bg-muted/30 transition-all cursor-pointer"
                >
                  <div className={cn(
                    "size-10 rounded-lg flex items-center justify-center",
                    tierConfig[customer.tier].icon
                  )}>
                    <Icons.plane className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{booking.code}</p>
                      <Badge className={cn("text-[10px] h-4 px-1.5", bookingStatusConfig[booking.status].color)}>
                        {bookingStatusConfig[booking.status].label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {booking.route} • {booking.date}
                    </p>
                  </div>
                  {booking.price && (
                    <p className="text-sm font-medium text-foreground">{booking.price}</p>
                  )}
                  <Icons.chevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Recent Activity */}
        {customer.recentActivity && customer.recentActivity.length > 0 && (
          <Section title="Hoạt động gần đây" icon={Icons.history} collapsible>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[11px] top-3 bottom-3 w-px bg-border" />
              
              <div className="space-y-3">
                {customer.recentActivity.map((activity, idx) => {
                  const Icon = activityIcons[activity.type]
                  return (
                    <div key={idx} className="flex items-start gap-3 relative">
                      <div className="size-6 rounded-full bg-muted border-2 border-background flex items-center justify-center z-10">
                        <Icon className="size-3 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-sm text-foreground">{activity.description}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{activity.timestamp}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </Section>
        )}

        {/* Internal Notes */}
        <Section 
          title="Ghi chú nội bộ" 
          icon={Icons.fileText}
          action={
            <Button variant="ghost" size="sm" className="h-6 text-xs gap-1 text-primary">
              <Icons.plus className="size-3" />
              Thêm
            </Button>
          }
        >
          {customer.internalNotes && customer.internalNotes.length > 0 ? (
            <div className="space-y-2">
              {customer.internalNotes.map((note) => (
                <div 
                  key={note.id}
                  className="p-3 rounded-lg bg-amber-50/60 border border-amber-100"
                >
                  <p className="text-sm text-foreground leading-relaxed">{note.content}</p>
                  <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
                    <span className="font-medium">{note.author}</span>
                    <span>•</span>
                    <span>{note.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Chưa có ghi chú nào
            </p>
          )}
        </Section>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <Button 
            className="flex-1 gap-2"
            onClick={onMessage}
          >
            <Icons.messageSquare className="size-4" />
            Gửi tin nhắn
          </Button>
          <Button variant="outline" className="gap-2">
            <Icons.sparkles className="size-4" />
            AI Insights
          </Button>
        </div>
      </div>
    </div>
  )
}
