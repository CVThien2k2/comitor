"use client"

import * as React from "react"
import { Icons } from "@/components/global/icons"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"

// Types
interface TabItem {
  id: string
  label: string
  icon: React.ElementType
}

interface TeamMember {
  id: string
  name: string
  email: string
  role: "owner" | "admin" | "agent" | "viewer"
  status: "active" | "pending" | "inactive"
  avatar: string
}

interface Permission {
  id: string
  name: string
  description: string
}

interface Integration {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  status: "connected" | "disconnected"
  color: string
}

// Data
const tabs: TabItem[] = [
  { id: "general", label: "Tổng quan", icon: Icons.building2 },
  { id: "team", label: "Thành viên", icon: Icons.users },
  { id: "permissions", label: "Phân quyền", icon: Icons.shield },
  { id: "notifications", label: "Thông báo", icon: Icons.bell },
  { id: "integrations", label: "Tích hợp", icon: Icons.puzzle },
]

const teamMembers: TeamMember[] = [
  { id: "1", name: "Nguyễn Văn An", email: "an.nguyen@company.com", role: "owner", status: "active", avatar: "NA" },
  { id: "2", name: "Trần Thị Bình", email: "binh.tran@company.com", role: "admin", status: "active", avatar: "TB" },
  { id: "3", name: "Lê Văn Cường", email: "cuong.le@company.com", role: "agent", status: "active", avatar: "LC" },
  { id: "4", name: "Phạm Thị Dung", email: "dung.pham@company.com", role: "agent", status: "pending", avatar: "PD" },
  { id: "5", name: "Hoàng Văn Em", email: "em.hoang@company.com", role: "viewer", status: "inactive", avatar: "HE" },
]

const roles = ["owner", "admin", "agent", "viewer"] as const
const roleLabels: Record<typeof roles[number], string> = {
  owner: "Chủ sở hữu",
  admin: "Quản trị viên",
  agent: "Nhân viên",
  viewer: "Xem",
}

const permissions: Permission[] = [
  { id: "inbox", name: "Hộp thư đến", description: "Xem và trả lời tin nhắn" },
  { id: "customers", name: "Khách hàng", description: "Quản lý hồ sơ khách hàng" },
  { id: "knowledge", name: "Tri thức", description: "Quản lý cơ sở tri thức" },
  { id: "reports", name: "Báo cáo", description: "Xem và xuất báo cáo" },
  { id: "settings", name: "Cài đặt", description: "Cấu hình hệ thống" },
  { id: "billing", name: "Thanh toán", description: "Quản lý thanh toán" },
]

const permissionMatrix: Record<string, Record<string, boolean>> = {
  owner: { inbox: true, customers: true, knowledge: true, reports: true, settings: true, billing: true },
  admin: { inbox: true, customers: true, knowledge: true, reports: true, settings: true, billing: false },
  agent: { inbox: true, customers: true, knowledge: false, reports: false, settings: false, billing: false },
  viewer: { inbox: true, customers: false, knowledge: false, reports: true, settings: false, billing: false },
}

const integrations: Integration[] = [
  { 
    id: "zalo", 
    name: "Zalo OA", 
    description: "Kết nối Zalo Official Account",
    icon: <ZaloIcon />,
    status: "connected",
    color: "bg-blue-500"
  },
  { 
    id: "meta", 
    name: "Meta Business", 
    description: "Facebook & Instagram Messenger",
    icon: <MetaIcon />,
    status: "connected",
    color: "bg-blue-600"
  },
  { 
    id: "stringee", 
    name: "Stringee", 
    description: "Tổng đài VoIP & Video call",
    icon: <StringeeIcon />,
    status: "disconnected",
    color: "bg-emerald-500"
  },
  { 
    id: "aws", 
    name: "AWS S3", 
    description: "Lưu trữ file và media",
    icon: <AWSS3Icon />,
    status: "connected",
    color: "bg-orange-500"
  },
  { 
    id: "resend", 
    name: "Resend Email", 
    description: "Gửi email transactional",
    icon: <ResendIcon />,
    status: "disconnected",
    color: "bg-slate-800"
  },
]

// Icon components
function ZaloIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 17.703c-.198.196-.49.31-.823.31H6.929c-.333 0-.625-.114-.823-.31-.198-.197-.306-.47-.306-.773V7.07c0-.303.108-.576.306-.773.198-.196.49-.31.823-.31h10.142c.333 0 .625.114.823.31.198.197.306.47.306.773v9.86c0 .303-.108.576-.306.773z"/>
    </svg>
  )
}

function MetaIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
    </svg>
  )
}

function StringeeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="currentColor">
      <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z"/>
    </svg>
  )
}

function AWSS3Icon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="currentColor">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
  )
}

function ResendIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="currentColor">
      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
    </svg>
  )
}

// Tab Content Components
function GeneralTab() {
  const [companyName, setCompanyName] = React.useState("TechViet Solutions")
  const [description, setDescription] = React.useState("Công ty công nghệ hàng đầu Việt Nam, chuyên cung cấp giải pháp phần mềm và dịch vụ CNTT.")
  
  return (
    <div className="space-y-8">
      {/* Company Logo */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">Logo công ty</h3>
          <p className="text-sm text-muted-foreground">Hiển thị trên giao diện và email</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="size-20 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white text-2xl font-bold">
            TV
          </div>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Icons.upload className="size-4" />
              Tải lên logo
            </Button>
            <p className="text-xs text-muted-foreground">PNG, JPG tối đa 2MB. Kích thước khuyến nghị 512x512px</p>
          </div>
        </div>
      </div>
      
      {/* Company Name */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Tên công ty</label>
        <Input 
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="max-w-md"
        />
      </div>
      
      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Mô tả</label>
        <textarea 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full max-w-lg rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
        />
      </div>
      
      {/* Work Hours */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">Giờ làm việc</h3>
          <p className="text-sm text-muted-foreground">Thời gian hoạt động của đội ngũ hỗ trợ</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg">
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Ngày làm việc</label>
            <div className="flex items-center gap-2">
              <Input defaultValue="T2" className="w-16 text-center" />
              <span className="text-muted-foreground">-</span>
              <Input defaultValue="T6" className="w-16 text-center" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Giờ bắt đầu</label>
            <Input defaultValue="08:00" type="time" />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Giờ kết thúc</label>
            <Input defaultValue="17:30" type="time" />
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Múi giờ:</span>
          <Badge variant="secondary" className="font-normal">GMT+7 (Việt Nam)</Badge>
        </div>
      </div>
      
      {/* Save button */}
      <div className="pt-4 border-t border-border">
        <Button className="bg-primary hover:bg-primary/90">
          Lưu thay đổi
        </Button>
      </div>
    </div>
  )
}

function TeamTab() {
  const [showInviteForm, setShowInviteForm] = React.useState(false)
  const [inviteEmail, setInviteEmail] = React.useState("")
  
  const statusColors: Record<TeamMember["status"], string> = {
    active: "bg-emerald-500/15 text-emerald-600 border-emerald-200",
    pending: "bg-amber-500/15 text-amber-600 border-amber-200",
    inactive: "bg-slate-500/15 text-slate-600 border-slate-200",
  }
  
  const statusLabels: Record<TeamMember["status"], string> = {
    active: "Hoạt động",
    pending: "Chờ xác nhận",
    inactive: "Không hoạt động",
  }
  
  const avatarColors = [
    "from-primary to-violet-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-rose-500 to-pink-600",
    "from-cyan-500 to-blue-600",
  ]
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-foreground">Thành viên nhóm</h3>
          <p className="text-sm text-muted-foreground">{teamMembers.length} thành viên</p>
        </div>
        <Button 
          onClick={() => setShowInviteForm(true)}
          className="gap-2 bg-primary hover:bg-primary/90"
        >
          <Icons.plus className="size-4" />
          Mời thành viên
        </Button>
      </div>
      
      {/* Invite form */}
      {showInviteForm && (
        <div className="p-4 rounded-lg border border-border bg-muted/30 space-y-3">
          <div className="flex items-center gap-3">
            <Input 
              placeholder="email@company.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1"
            />
            <select className="h-9 px-3 rounded-md border border-input bg-background text-sm">
              <option value="agent">Nhân viên</option>
              <option value="admin">Quản trị viên</option>
              <option value="viewer">Chỉ xem</option>
            </select>
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              Gửi lời mời
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => {
                setShowInviteForm(false)
                setInviteEmail("")
              }}
            >
              <Icons.x className="size-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Members table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Thành viên</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Vai trò</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Trạng thái</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {teamMembers.map((member, idx) => (
              <tr key={member.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarFallback className={cn("text-xs text-white bg-gradient-to-br", avatarColors[idx % avatarColors.length])}>
                        {member.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {member.role === "owner" ? (
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      {roleLabels[member.role]}
                    </Badge>
                  ) : (
                    <div className="relative inline-block">
                      <select 
                        defaultValue={member.role}
                        className="appearance-none bg-transparent border border-border rounded-md px-3 py-1 pr-8 text-sm cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        {roles.filter(r => r !== "owner").map(role => (
                          <option key={role} value={role}>{roleLabels[role]}</option>
                        ))}
                      </select>
                      <Icons.chevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={cn("text-xs", statusColors[member.status])}>
                    {statusLabels[member.status]}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  {member.role !== "owner" && (
                    <Button variant="ghost" size="sm" className="size-8 p-0 text-muted-foreground hover:text-destructive">
                      <Icons.moreHorizontal className="size-4" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PermissionsTab() {
  const [matrix, setMatrix] = React.useState(permissionMatrix)
  
  const togglePermission = (role: string, permission: string) => {
    if (role === "owner") return // Can't change owner permissions
    setMatrix(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permission]: !prev[role]?.[permission]
      }
    }))
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-foreground">Ma trận phân quyền</h3>
        <p className="text-sm text-muted-foreground">Cấu hình quyền truy cập cho từng vai trò</p>
      </div>
      
      <div className="border border-border rounded-lg overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 w-48">Quyền</th>
              {roles.map(role => (
                <th key={role} className="text-center text-xs font-medium text-muted-foreground px-4 py-3">
                  {roleLabels[role]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {permissions.map(permission => (
              <tr key={permission.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{permission.name}</p>
                    <p className="text-xs text-muted-foreground">{permission.description}</p>
                  </div>
                </td>
                {roles.map(role => (
                  <td key={role} className="px-4 py-3 text-center">
                    <button
                      onClick={() => togglePermission(role, permission.id)}
                      disabled={role === "owner"}
                      className={cn(
                        "size-6 rounded-md border-2 flex items-center justify-center transition-all",
                        matrix[role]?.[permission.id]
                          ? "bg-primary border-primary text-white"
                          : "border-border hover:border-primary/50",
                        role === "owner" && "cursor-not-allowed opacity-70"
                      )}
                    >
                      {matrix[role]?.[permission.id] && <Icons.check className="size-4" />}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="pt-4 border-t border-border">
        <Button className="bg-primary hover:bg-primary/90">
          Lưu thay đổi
        </Button>
      </div>
    </div>
  )
}

function NotificationsTab() {
  const [settings, setSettings] = React.useState({
    email: true,
    desktop: true,
    sound: false,
    newMessage: true,
    newCustomer: true,
    taskAssigned: true,
    mention: true,
  })
  
  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }
  
  const channels = [
    { id: "email", label: "Email", icon: Icons.mail, description: "Nhận thông báo qua email" },
    { id: "desktop", label: "Desktop", icon: Icons.monitor, description: "Thông báo trên trình duyệt" },
    { id: "sound", label: "Âm thanh", icon: Icons.volume2, description: "Phát âm thanh khi có thông báo" },
  ]
  
  const types = [
    { id: "newMessage", label: "Tin nhắn mới", description: "Khi có tin nhắn từ khách hàng" },
    { id: "newCustomer", label: "Khách hàng mới", description: "Khi có khách hàng mới đăng ký" },
    { id: "taskAssigned", label: "Task được giao", description: "Khi có task mới được giao cho bạn" },
    { id: "mention", label: "Được nhắc đến", description: "Khi ai đó mention bạn trong ghi chú" },
  ]
  
  return (
    <div className="space-y-8">
      {/* Channels */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">Kênh thông báo</h3>
          <p className="text-sm text-muted-foreground">Chọn cách bạn muốn nhận thông báo</p>
        </div>
        <div className="space-y-3">
          {channels.map(channel => (
            <div 
              key={channel.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-muted flex items-center justify-center">
                  <channel.icon className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{channel.label}</p>
                  <p className="text-xs text-muted-foreground">{channel.description}</p>
                </div>
              </div>
              <button
                onClick={() => toggleSetting(channel.id as keyof typeof settings)}
                className={cn(
                  "relative w-11 h-6 rounded-full transition-colors",
                  settings[channel.id as keyof typeof settings] ? "bg-primary" : "bg-muted"
                )}
              >
                <span 
                  className={cn(
                    "absolute top-1 left-1 size-4 rounded-full bg-white shadow-sm transition-transform",
                    settings[channel.id as keyof typeof settings] && "translate-x-5"
                  )}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {/* Types */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">Loại thông báo</h3>
          <p className="text-sm text-muted-foreground">Chọn những gì bạn muốn được thông báo</p>
        </div>
        <div className="space-y-2">
          {types.map(type => (
            <label 
              key={type.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{type.label}</p>
                <p className="text-xs text-muted-foreground">{type.description}</p>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={settings[type.id as keyof typeof settings]}
                  onChange={() => toggleSetting(type.id as keyof typeof settings)}
                  className="peer sr-only"
                />
                <div className={cn(
                  "size-5 rounded border-2 flex items-center justify-center transition-all",
                  settings[type.id as keyof typeof settings]
                    ? "bg-primary border-primary text-white"
                    : "border-border"
                )}>
                  {settings[type.id as keyof typeof settings] && <Icons.check className="size-3" />}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>
      
      <div className="pt-4 border-t border-border">
        <Button className="bg-primary hover:bg-primary/90">
          Lưu thay đổi
        </Button>
      </div>
    </div>
  )
}

function IntegrationsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-foreground">Tích hợp bên thứ ba</h3>
        <p className="text-sm text-muted-foreground">Kết nối với các dịch vụ và nền tảng khác</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map(integration => (
          <div 
            key={integration.id}
            className="p-4 rounded-xl border border-border bg-card hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={cn("size-12 rounded-xl flex items-center justify-center text-white", integration.color)}>
                {integration.icon}
              </div>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs",
                  integration.status === "connected"
                    ? "bg-emerald-500/15 text-emerald-600 border-emerald-200"
                    : "bg-slate-500/15 text-slate-600 border-slate-200"
                )}
              >
                {integration.status === "connected" ? "Đã kết nối" : "Chưa kết nối"}
              </Badge>
            </div>
            <h4 className="text-sm font-medium text-foreground mb-1">{integration.name}</h4>
            <p className="text-xs text-muted-foreground mb-4">{integration.description}</p>
            <div className="flex items-center gap-2">
              {integration.status === "connected" ? (
                <>
                  <Button variant="outline" size="sm" className="flex-1 gap-1.5">
                    <Icons.externalLink className="size-3.5" />
                    Cấu hình
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Icons.trash className="size-4" />
                  </Button>
                </>
              ) : (
                <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90">
                  Kết nối
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Main component
export function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState("general")
  
  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return <GeneralTab />
      case "team":
        return <TeamTab />
      case "permissions":
        return <PermissionsTab />
      case "notifications":
        return <NotificationsTab />
      case "integrations":
        return <IntegrationsTab />
      default:
        return <GeneralTab />
    }
  }
  
  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-60 border-r border-border bg-card/50 p-4 flex flex-col">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground">Cài đặt</h2>
          <p className="text-sm text-muted-foreground">Quản lý tài khoản và hệ thống</p>
        </div>
        
        <nav className="space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <tab.icon className="size-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}
