'use client'

import { Icons } from '@/components/global/icons'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { cn } from '@workspace/ui/lib/utils'

const stats = [
  {
    title: 'Tin nhắn hôm nay',
    value: '2,847',
    change: '+12.5%',
    trend: 'up',
    icon: Icons.messageSquare,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    title: 'Khách hàng mới',
    value: '184',
    change: '+8.2%',
    trend: 'up',
    icon: Icons.users,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  {
    title: 'Tỷ lệ phản hồi',
    value: '94.2%',
    change: '+2.1%',
    trend: 'up',
    icon: Icons.trendingUp,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  {
    title: 'Thời gian phản hồi',
    value: '< 2 phút',
    change: '-18%',
    trend: 'down',
    icon: Icons.clock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
]

const recentConversations = [
  {
    id: 1,
    name: 'Trần Minh Anh',
    avatar: 'MA',
    message: 'Cho mình hỏi về tour Đà Nẵng 3 ngày 2 đêm...',
    time: '2 phút trước',
    channel: 'Zalo',
    status: 'unread',
    channelColor: 'bg-blue-500',
  },
  {
    id: 2,
    name: 'Lê Hoàng Nam',
    avatar: 'HN',
    message: 'Mình muốn đặt tour Phú Quốc cho 4 người',
    time: '5 phút trước',
    channel: 'Facebook',
    status: 'unread',
    channelColor: 'bg-indigo-500',
  },
  {
    id: 3,
    name: 'Phạm Thu Hà',
    avatar: 'TH',
    message: 'Cảm ơn bạn đã hỗ trợ, mình rất hài lòng!',
    time: '12 phút trước',
    channel: 'Website',
    status: 'read',
    channelColor: 'bg-emerald-500',
  },
  {
    id: 4,
    name: 'Nguyễn Văn Đức',
    avatar: 'VĐ',
    message: 'Tour này có bao gồm vé máy bay không ạ?',
    time: '18 phút trước',
    channel: 'Zalo',
    status: 'read',
    channelColor: 'bg-blue-500',
  },
  {
    id: 5,
    name: 'Hoàng Thị Mai',
    avatar: 'TM',
    message: 'Cho mình xin thông tin chi tiết về lịch trình',
    time: '25 phút trước',
    channel: 'Instagram',
    status: 'read',
    channelColor: 'bg-pink-500',
  },
]

const aiSuggestions = [
  {
    type: 'response',
    title: 'Gợi ý trả lời tự động',
    description: '3 khách hàng đang chờ phản hồi về tour Đà Nẵng',
    action: 'Xem gợi ý',
  },
  {
    type: 'insight',
    title: 'Xu hướng booking',
    description: 'Tour Phú Quốc tăng 45% so với tuần trước',
    action: 'Xem chi tiết',
  },
]

export function DashboardContent() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-card border-b border-border">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">
            Xin chào, Nguyễn Thành
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Đây là tổng quan hoạt động của bạn hôm nay
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="h-9 w-64 rounded-lg border border-input bg-background pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all"
            />
          </div>
          <Button variant="ghost" size="icon" className="relative">
            <Icons.bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
          </Button>
          <Button className="gap-2 shadow-sm">
            <Icons.plus className="w-4 h-4" />
            <span>Tạo mới</span>
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className={cn('p-2.5 rounded-lg', stat.bgColor)}>
                    <stat.icon className={cn('w-5 h-5', stat.color)} />
                  </div>
                  <div className={cn(
                    'flex items-center gap-1 text-xs font-medium',
                    stat.trend === 'up' ? 'text-emerald-600' : 'text-blue-600'
                  )}>
                    {stat.trend === 'up' ? (
                      <Icons.arrowUpRight className="w-3.5 h-3.5" />
                    ) : (
                      <Icons.arrowDownRight className="w-3.5 h-3.5" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-semibold text-foreground tracking-tight">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {stat.title}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Recent Conversations */}
          <Card className="col-span-2 border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-base font-semibold">
                  Hội thoại gần đây
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Các cuộc trò chuyện mới nhất từ khách hàng
                </p>
              </div>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
                Xem tất cả
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1">
                {recentConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={cn(
                      'flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all',
                      'hover:bg-muted/50',
                      conversation.status === 'unread' && 'bg-primary/[0.03]'
                    )}
                  >
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 text-xs font-medium">
                          {conversation.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <span className={cn(
                        'absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card',
                        conversation.channelColor
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={cn(
                          'text-sm truncate',
                          conversation.status === 'unread' 
                            ? 'font-semibold text-foreground' 
                            : 'font-medium text-foreground'
                        )}>
                          {conversation.name}
                        </p>
                        <span className="text-xs text-muted-foreground shrink-0 ml-2">
                          {conversation.time}
                        </span>
                      </div>
                      <p className={cn(
                        'text-sm truncate mt-0.5',
                        conversation.status === 'unread' 
                          ? 'text-foreground/80' 
                          : 'text-muted-foreground'
                      )}>
                        {conversation.message}
                      </p>
                    </div>
                    {conversation.status === 'unread' && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    )}
                    <Button variant="ghost" size="icon-sm" className="shrink-0 opacity-0 group-hover:opacity-100">
                      <Icons.moreHorizontal className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <div className="space-y-4">
            <Card className="border-border/50 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icons.sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">AI Assistant</h3>
                    <p className="text-xs text-muted-foreground">Gợi ý thông minh</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {aiSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg bg-card border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all cursor-pointer group"
                    >
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {suggestion.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {suggestion.description}
                      </p>
                      <Button variant="link" size="sm" className="h-auto p-0 mt-2 text-primary">
                        {suggestion.action} →
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Thao tác nhanh</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="h-auto py-3 flex-col gap-1.5 border-dashed hover:border-primary hover:bg-primary/5">
                    <Icons.messageSquare className="w-4 h-4 text-primary" />
                    <span className="text-xs">Gửi tin nhắn</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-3 flex-col gap-1.5 border-dashed hover:border-primary hover:bg-primary/5">
                    <Icons.users className="w-4 h-4 text-primary" />
                    <span className="text-xs">Thêm khách hàng</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Activity Feed */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">Hoạt động</CardTitle>
                  <Badge variant="secondary" className="text-[10px]">Hôm nay</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <ActivityItem
                    avatar="TM"
                    avatarBg="from-pink-400 to-rose-500"
                    title="Hoàng Thị Mai đã đặt tour"
                    description="Tour Phú Quốc 4N3Đ"
                    time="10 phút trước"
                  />
                  <ActivityItem
                    avatar="VĐ"
                    avatarBg="from-blue-400 to-indigo-500"
                    title="Nguyễn Văn Đức đã thanh toán"
                    description="12.500.000 VNĐ"
                    time="25 phút trước"
                  />
                  <ActivityItem
                    avatar="AI"
                    avatarBg="from-indigo-400 to-purple-500"
                    title="AI đã phản hồi tự động"
                    description="3 khách hàng mới"
                    time="1 giờ trước"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function ActivityItem({
  avatar,
  avatarBg,
  title,
  description,
  time,
}: {
  avatar: string
  avatarBg: string
  title: string
  description: string
  time: string
}) {
  return (
    <div className="flex items-start gap-3">
      <Avatar className="w-8 h-8">
        <AvatarFallback className={cn('bg-gradient-to-br text-white text-[10px] font-medium', avatarBg)}>
          {avatar}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground leading-snug">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <span className="text-[10px] text-muted-foreground shrink-0">{time}</span>
    </div>
  )
}
