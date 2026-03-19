"use client"

import * as React from "react"
import { Icons } from "@/components/global/icons"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"

// Types
export interface CustomerTask {
  id: string
  title: string
  dueDate?: string
  status: "todo" | "in-progress" | "done"
  priority?: "high" | "medium" | "low"
}

export interface CustomerNote {
  id: string
  content: string
  author: string
  timestamp: string
}

export interface CustomerInfo {
  id: string
  name: string
  email?: string
  phone?: string
  avatarColor: string
  role?: string
  tags?: string[]
  organization?: {
    name: string
    website?: string
    industry?: string
    size?: string
    location?: string
  }
  isVIP?: boolean
  isB2B?: boolean
  lastActivity?: string
  firstContact?: string
  tasks?: CustomerTask[]
  notes?: CustomerNote[]
  totalConversations?: number
}

interface CustomerInfoPanelProps {
  customer: CustomerInfo
  onAddNote?: (note: string) => void
  onAddTask?: () => void
}

function Section({ 
  title, 
  icon: Icon, 
  children, 
  action 
}: { 
  title: string
  icon: React.ElementType
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="py-4 border-b border-border last:border-b-0">
      <div className="flex items-center justify-between mb-3 px-4">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-muted-foreground" />
          <h4 className="text-sm font-medium text-foreground">{title}</h4>
        </div>
        {action}
      </div>
      <div className="px-4">{children}</div>
    </div>
  )
}

function InfoRow({ 
  icon: Icon, 
  label, 
  value, 
  isLink = false 
}: { 
  icon: React.ElementType
  label: string
  value?: string
  isLink?: boolean
}) {
  if (!value) return null
  
  return (
    <div className="flex items-start gap-3 py-1.5">
      <Icon className="size-4 text-muted-foreground shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</p>
        {isLink ? (
          <a 
            href={value.startsWith("http") ? value : `https://${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            {value}
            <Icons.externalLink className="size-3" />
          </a>
        ) : (
          <p className="text-sm text-foreground">{value}</p>
        )}
      </div>
    </div>
  )
}

function TaskCard({ task }: { task: CustomerTask }) {
  const statusIcons = {
    todo: Icons.circle,
    "in-progress": Icons.clock,
    done: Icons.checkCircle2,
  }
  const StatusIcon = statusIcons[task.status]

  const statusColors = {
    todo: "text-muted-foreground",
    "in-progress": "text-amber-500",
    done: "text-emerald-500",
  }

  const priorityColors = {
    high: "bg-red-100 text-red-700 border-red-200",
    medium: "bg-amber-100 text-amber-700 border-amber-200",
    low: "bg-slate-100 text-slate-600 border-slate-200",
  }

  return (
    <div className="group flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border/50 hover:border-border hover:bg-muted/70 transition-all duration-200 cursor-pointer">
      <StatusIcon className={cn("size-4 shrink-0 mt-0.5", statusColors[task.status])} />
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm",
          task.status === "done" ? "text-muted-foreground line-through" : "text-foreground"
        )}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          {task.dueDate && (
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Icons.calendar className="size-3" />
              {task.dueDate}
            </span>
          )}
          {task.priority && (
            <Badge 
              variant="outline" 
              className={cn("text-[10px] h-4 px-1.5", priorityColors[task.priority])}
            >
              {task.priority === "high" ? "Cao" : task.priority === "medium" ? "Trung bình" : "Thấp"}
            </Badge>
          )}
        </div>
      </div>
      <Icons.chevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  )
}

function NoteCard({ note }: { note: CustomerNote }) {
  return (
    <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-100">
      <p className="text-sm text-foreground leading-relaxed">{note.content}</p>
      <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
        <span className="font-medium">{note.author}</span>
        <span>•</span>
        <span>{note.timestamp}</span>
      </div>
    </div>
  )
}

export function CustomerInfoPanel({ customer, onAddNote, onAddTask }: CustomerInfoPanelProps) {
  const [noteInput, setNoteInput] = React.useState("")
  const [showNoteInput, setShowNoteInput] = React.useState(false)

  const initials = customer.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const handleAddNote = () => {
    if (noteInput.trim() && onAddNote) {
      onAddNote(noteInput.trim())
      setNoteInput("")
      setShowNoteInput(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-background border-l border-border">
      {/* Profile Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-start gap-3">
          <Avatar className="size-14">
            <AvatarFallback 
              className="text-lg font-semibold text-white"
              style={{ backgroundColor: customer.avatarColor }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground text-lg">{customer.name}</h3>
              {customer.isVIP && (
                <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] h-5">
                  VIP
                </Badge>
              )}
              {customer.isB2B && (
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px] h-5">
                  B2B
                </Badge>
              )}
            </div>
            {customer.role && (
              <p className="text-sm text-muted-foreground mt-0.5">{customer.role}</p>
            )}
            
            {/* Tags */}
            {customer.tags && customer.tags.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {customer.tags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="outline" 
                    className="text-[10px] h-5 px-2 bg-muted/50"
                  >
                    {tag}
                  </Badge>
                ))}
                <Button variant="ghost" size="icon-sm" className="size-5 text-muted-foreground">
                  <Icons.plus className="size-3" />
                </Button>
              </div>
            )}
          </div>

          <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
            <Icons.edit className="size-4" />
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/50">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Icons.messageSquare className="size-3.5" />
            <span>{customer.totalConversations || 0} hội thoại</span>
          </div>
          {customer.firstContact && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Icons.calendar className="size-3.5" />
              <span>Từ {customer.firstContact}</span>
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Contact Info */}
        <Section title="Thông tin liên hệ" icon={Icons.user}>
          <div className="space-y-1">
            <InfoRow icon={Icons.mail} label="Email" value={customer.email} />
            <InfoRow icon={Icons.phone} label="Điện thoại" value={customer.phone} />
          </div>
        </Section>

        {/* Organization */}
        {customer.organization && (
          <Section title="Tổ chức" icon={Icons.building2}>
            <div className="space-y-1">
              <InfoRow 
                icon={Icons.building2} 
                label="Công ty" 
                value={customer.organization.name} 
              />
              {customer.organization.website && (
                <InfoRow 
                  icon={Icons.externalLink} 
                  label="Website" 
                  value={customer.organization.website}
                  isLink 
                />
              )}
              <InfoRow 
                icon={Icons.tag} 
                label="Ngành" 
                value={customer.organization.industry} 
              />
              <InfoRow 
                icon={Icons.user} 
                label="Quy mô" 
                value={customer.organization.size} 
              />
              <InfoRow 
                icon={Icons.mapPin} 
                label="Địa điểm" 
                value={customer.organization.location} 
              />
            </div>
          </Section>
        )}

        {/* Tasks */}
        <Section 
          title="Công việc" 
          icon={Icons.checkCircle2}
          action={
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs gap-1 text-primary"
              onClick={onAddTask}
            >
              <Icons.plus className="size-3" />
              Thêm
            </Button>
          }
        >
          <div className="space-y-2">
            {customer.tasks && customer.tasks.length > 0 ? (
              customer.tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Chưa có công việc nào
              </p>
            )}
          </div>
        </Section>

        {/* Internal Notes */}
        <Section 
          title="Ghi chú nội bộ" 
          icon={Icons.fileText}
          action={
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs gap-1 text-primary"
              onClick={() => setShowNoteInput(true)}
            >
              <Icons.plus className="size-3" />
              Thêm
            </Button>
          }
        >
          <div className="space-y-2">
            {showNoteInput && (
              <div className="p-3 rounded-lg border border-primary/30 bg-primary/5">
                <textarea
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Nhập ghi chú..."
                  rows={2}
                  className="w-full bg-transparent resize-none text-sm placeholder:text-muted-foreground focus:outline-none"
                  autoFocus
                />
                <div className="flex items-center justify-end gap-2 mt-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-xs"
                    onClick={() => {
                      setShowNoteInput(false)
                      setNoteInput("")
                    }}
                  >
                    Hủy
                  </Button>
                  <Button 
                    size="sm" 
                    className="h-7 text-xs"
                    onClick={handleAddNote}
                    disabled={!noteInput.trim()}
                  >
                    Lưu
                  </Button>
                </div>
              </div>
            )}
            
            {customer.notes && customer.notes.length > 0 ? (
              customer.notes.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))
            ) : !showNoteInput && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Chưa có ghi chú nào
              </p>
            )}
          </div>
        </Section>
      </div>
    </div>
  )
}
