"use client"

import { Badge } from "@workspace/ui/components/badge"
import { Textarea } from "@workspace/ui/components/textarea"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { Card } from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import { AlertCircle, CheckCircle2, Mail, Phone, Building } from "lucide-react"

interface Task {
  id: string
  title: string
  status: "pending" | "completed"
  dueDate: string
  priority?: "high" | "normal"
}

const tasks: Task[] = [
  {
    id: "1",
    title: "Gửi báo giá đoàn 30 khách",
    status: "pending",
    dueDate: "Mai",
    priority: "high",
  },
  {
    id: "2",
    title: "Xác nhận hợp đồng Q3",
    status: "completed",
    dueDate: "Hôm qua",
  },
]

export function ContextPanel() {
  return (
    <aside className="flex h-full w-80 min-w-80 flex-col overflow-y-auto border-l bg-background">
      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        {/* Customer Profile */}
        <div>
          <h4 className="mb-4 text-xs font-bold tracking-wider text-muted-foreground uppercase">Hồ sơ khách hàng</h4>
          <div className="mb-4 flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-blue-500 text-lg font-bold text-white">MN</AvatarFallback>
            </Avatar>
            <div>
              <h5 className="text-sm font-bold">Mai Nguyễn</h5>
              <p className="text-xs text-muted-foreground">Trưởng phòng đặt chỗ</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-xs">
              <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-foreground">mai@vietnamairlines.com</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-foreground">+84 90 123 4567</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Badge className="border border-indigo-300 bg-indigo-500/20 text-indigo-700 dark:border-indigo-600 dark:text-indigo-300">
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
          <h4 className="mb-4 text-xs font-bold tracking-wider text-muted-foreground uppercase">Tổ chức</h4>
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-indigo-600 text-xs font-bold text-white">VA</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h5 className="text-sm font-bold">Vietnam Airlines</h5>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Building className="h-3 w-3" />
                Liên hệ: Hùng Phạm
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Tasks */}
        <div>
          <h4 className="mb-4 text-xs font-bold tracking-wider text-muted-foreground uppercase">
            Công việc đang mở ({tasks.filter((t) => t.status === "pending").length})
          </h4>
          <div className="space-y-3">
            {tasks.map((task) => (
              <Card
                key={task.id}
                className={`p-3 ${
                  task.status === "pending"
                    ? "border-amber-200 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/30"
                    : "border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/30"
                }`}
              >
                <div className="flex gap-2">
                  {task.status === "pending" ? (
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  ) : (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs font-semibold ${
                        task.status === "pending"
                          ? "text-amber-900 dark:text-amber-100"
                          : "text-green-900 dark:text-green-100"
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <Badge variant={task.status === "pending" ? "destructive" : "secondary"} className="text-[10px]">
                        {task.status === "pending" ? "Đang chờ" : "Đã xong"}
                      </Badge>
                      <span
                        className={`text-[10px] ${
                          task.status === "pending"
                            ? "text-amber-700 dark:text-amber-300"
                            : "text-green-700 dark:text-green-300"
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
          <h4 className="mb-4 text-xs font-bold tracking-wider text-muted-foreground uppercase">Ghi chú nội bộ</h4>
          <Textarea
            placeholder="Thêm ghi chú riêng cho team..."
            rows={3}
            defaultValue="Khách hàng quan tâm đến chính sách hoàn hủy linh hoạt cho đoàn lớn."
            className="w-full border-border bg-muted/30 text-xs text-foreground placeholder:text-muted-foreground dark:bg-muted/20"
          />
        </div>
      </div>
    </aside>
  )
}
