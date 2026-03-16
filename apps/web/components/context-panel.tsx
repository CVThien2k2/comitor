'use client'

import { Badge } from '@workspace/ui/components/badge'
import { Textarea } from '@workspace/ui/components/textarea'
import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar'
import { Card } from '@workspace/ui/components/card'
import { Separator } from '@workspace/ui/components/separator'
import { AlertCircle, CheckCircle2, Mail, Phone, Building } from 'lucide-react'

interface Task {
  id: string
  title: string
  status: 'pending' | 'completed'
  dueDate: string
  priority?: 'high' | 'normal'
}

const tasks: Task[] = [
  {
    id: '1',
    title: 'Gửi báo giá đoàn 30 khách',
    status: 'pending',
    dueDate: 'Mai',
    priority: 'high',
  },
  {
    id: '2',
    title: 'Xác nhận hợp đồng Q3',
    status: 'completed',
    dueDate: 'Hôm qua',
  },
]

export function ContextPanel() {
  return (
    <aside className="w-80 min-w-80 border-l bg-background flex flex-col h-full overflow-y-auto">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {/* Customer Profile */}
      <div>
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
          Hồ sơ khách hàng
        </h4>
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="w-12 h-12">
            <AvatarFallback className="bg-blue-500 text-white font-bold text-lg">
              MN
            </AvatarFallback>
          </Avatar>
          <div>
            <h5 className="font-bold text-sm">Mai Nguyễn</h5>
            <p className="text-xs text-muted-foreground">Trưởng phòng đặt chỗ</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-xs">
            <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-foreground">mai@vietnamairlines.com</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-foreground">+84 90 123 4567</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <Badge className="bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-600">
              VIP
            </Badge>
            <Badge
              variant="secondary"
              className="bg-secondary/80 text-secondary-foreground dark:text-muted-foreground"
            >
              B2B
            </Badge>
          </div>
        </div>
      </div>

      <Separator />

      {/* Organization */}
      <div>
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
          Tổ chức
        </h4>
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-indigo-600 text-white font-bold text-xs">
              VA
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h5 className="font-bold text-sm">Vietnam Airlines</h5>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Building className="w-3 h-3" />
              Liên hệ: Hùng Phạm
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Tasks */}
      <div>
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
          Công việc đang mở ({tasks.filter((t) => t.status === 'pending').length})
        </h4>
        <div className="space-y-3">
          {tasks.map((task) => (
            <Card
              key={task.id}
              className={`p-3 ${
                task.status === 'pending'
                  ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700'
                  : 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700'
              }`}
            >
              <div className="flex gap-2">
                {task.status === 'pending' ? (
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-semibold ${
                      task.status === 'pending'
                        ? 'text-amber-900 dark:text-amber-100'
                        : 'text-green-900 dark:text-green-100'
                    }`}
                  >
                    {task.title}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <Badge
                      variant={task.status === 'pending' ? 'destructive' : 'secondary'}
                      className="text-[10px]"
                    >
                      {task.status === 'pending' ? 'Đang chờ' : 'Đã xong'}
                    </Badge>
                    <span
                      className={`text-[10px] ${
                        task.status === 'pending'
                          ? 'text-amber-700 dark:text-amber-300'
                          : 'text-green-700 dark:text-green-300'
                      }`}
                    >
                      {task.dueDate}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      {/* Internal Notes */}
      <div>
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
          Ghi chú nội bộ
        </h4>
        <Textarea
          placeholder="Thêm ghi chú riêng cho team..."
          rows={3}
          defaultValue="Khách hàng quan tâm đến chính sách hoàn hủy linh hoạt cho đoàn lớn."
          className="w-full text-xs text-foreground placeholder:text-muted-foreground bg-muted/30 dark:bg-muted/20 border-border"
        />
      </div>
      </div>
    </aside>
  )
}
