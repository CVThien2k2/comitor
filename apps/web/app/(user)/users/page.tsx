"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import type { ColumnDef, PaginationState, SortingState, Updater } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/table/data-table-column-header"
import { DataTableRowAction } from "@/components/table/data-table-row-action"
import DataTable from "@/components/table/data-table"
import { Icons } from "@/components/global/icons"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { toast } from "@workspace/ui/components/sonner"
import { cn } from "@workspace/ui/lib/utils"

type UserRoleCode = "admin" | "supervisor" | "agent" | "qa" | "intern"
type ActivityFilter = "all" | "active" | "inactive"
type PresenceFilter = "all" | "online" | "offline"
type ReadinessFilter = "all" | "ready" | "busy"

type MockUser = {
  id: string
  name: string
  email: string
  username: string
  phone: string | null
  isActive: boolean
  isOnline: boolean
  emailVerified: boolean
  isReadyProcessing: boolean
  countProcessing: number
  createdAt: string
  updatedAt: string
  avatarUrl: string | null
  role: {
    id: string
    name: string
    code: UserRoleCode
  }
  team: string
  shift: "Sáng" | "Chiều" | "Tối"
  lastSeenAt: string
  handledLeads: number
}

type MockUsersQuery = {
  page: number
  limit: number
  search: string
  role: UserRoleCode | "all"
  activity: ActivityFilter
  presence: PresenceFilter
  readiness: ReadinessFilter
  sorting: SortingState
}

type MockUsersResponse = {
  items: MockUser[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  summary: {
    total: number
    active: number
    online: number
    ready: number
    verified: number
  }
}

const ROLES: Array<{ code: UserRoleCode; name: string }> = [
  { code: "admin", name: "Quản trị" },
  { code: "supervisor", name: "Giám sát" },
  { code: "agent", name: "Nhân viên" },
  { code: "qa", name: "Kiểm định" },
  { code: "intern", name: "Thực tập" },
]

const TEAMS = ["Growth", "Retention", "Support", "Onboarding", "Social", "KOL"]
const FIRST_NAMES = [
  "An",
  "Bình",
  "Chi",
  "Dũng",
  "Giang",
  "Hà",
  "Huy",
  "Khánh",
  "Linh",
  "Minh",
  "Nam",
  "Ngọc",
  "Phúc",
  "Quân",
  "Thảo",
  "Trang",
  "Uyên",
  "Việt",
]
const LAST_NAMES = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Vũ", "Đặng", "Bùi", "Phan", "Đỗ"]

const MOCK_USERS = buildMockUsers(500)

function seeded(seed: number) {
  const value = Math.sin(seed * 12_989.77) * 43_758.5453
  return value - Math.floor(value)
}

function pick<T>(values: T[], seed: number): T {
  return values[Math.floor(seeded(seed) * values.length)]!
}

function buildMockUsers(total: number): MockUser[] {
  const now = Date.now()

  return Array.from({ length: total }, (_, index) => {
    const i = index + 1
    const firstName = pick(FIRST_NAMES, i * 13)
    const lastName = pick(LAST_NAMES, i * 17)
    const name = `${lastName} ${firstName}`
    const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${String(i).padStart(3, "0")}`
    const role = pick(ROLES, i * 19)
    const team = pick(TEAMS, i * 23)

    const createdAt = new Date(now - (8 + (i % 320)) * 86_400_000)
    const updatedAt = new Date(createdAt.getTime() + (i % 40) * 3_600_000)

    const isActive = i % 9 !== 0
    const isOnline = isActive && i % 4 === 0
    const emailVerified = i % 5 !== 0
    const isReadyProcessing = isActive && i % 6 !== 0

    const minutesAgo = isOnline ? i % 18 : 30 + (i % 1900)
    const lastSeenAt = new Date(now - minutesAgo * 60_000).toISOString()

    return {
      id: `mock-user-${String(i).padStart(4, "0")}`,
      name,
      email: `${username}@comitor.vn`,
      username,
      phone: `0${9 - (i % 3)}${String(100_000_00 + ((i * 17_321) % 90_000_000)).padStart(8, "0")}`,
      isActive,
      isOnline,
      emailVerified,
      isReadyProcessing,
      countProcessing: isActive ? i % 12 : 0,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
      avatarUrl: null,
      role: {
        id: `role-${role.code}`,
        name: role.name,
        code: role.code,
      },
      team,
      shift: (["Sáng", "Chiều", "Tối"] as const)[i % 3]!,
      lastSeenAt,
      handledLeads: 20 + ((i * 7) % 240),
    }
  })
}

function compareBySort(a: MockUser, b: MockUser, sorting: SortingState) {
  const firstSort = sorting[0]
  if (!firstSort) return 0

  const direction = firstSort.desc ? -1 : 1
  const sortKey = firstSort.id

  const compareString = (left: string, right: string) => left.localeCompare(right, "vi", { sensitivity: "base" })

  if (sortKey === "name") return compareString(a.name, b.name) * direction
  if (sortKey === "role") return compareString(a.role.name, b.role.name) * direction
  if (sortKey === "updatedAt") return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * direction
  if (sortKey === "workload") return (a.countProcessing - b.countProcessing) * direction
  if (sortKey === "performance") return (a.handledLeads - b.handledLeads) * direction

  return 0
}

async function fetchMockUsers(query: MockUsersQuery): Promise<MockUsersResponse> {
  await new Promise((resolve) => setTimeout(resolve, 350 + Math.round(Math.random() * 550)))

  const searchTerm = query.search.trim().toLowerCase()

  let rows = MOCK_USERS.filter((user) => {
    if (query.role !== "all" && user.role.code !== query.role) return false
    if (query.activity === "active" && !user.isActive) return false
    if (query.activity === "inactive" && user.isActive) return false
    if (query.presence === "online" && !user.isOnline) return false
    if (query.presence === "offline" && user.isOnline) return false
    if (query.readiness === "ready" && !user.isReadyProcessing) return false
    if (query.readiness === "busy" && user.isReadyProcessing) return false

    if (!searchTerm) return true

    const searchable = [user.name, user.username, user.email, user.phone ?? "", user.team, user.role.name]
      .join(" ")
      .toLowerCase()

    return searchable.includes(searchTerm)
  })

  rows = [...rows].sort((a, b) => compareBySort(a, b, query.sorting))

  const total = rows.length
  const totalPages = Math.max(1, Math.ceil(total / query.limit))
  const page = Math.min(Math.max(1, query.page), totalPages)
  const start = (page - 1) * query.limit
  const items = rows.slice(start, start + query.limit)

  return {
    items,
    meta: {
      page,
      limit: query.limit,
      total,
      totalPages,
    },
    summary: {
      total,
      active: rows.filter((user) => user.isActive).length,
      online: rows.filter((user) => user.isOnline).length,
      ready: rows.filter((user) => user.isReadyProcessing).length,
      verified: rows.filter((user) => user.emailVerified).length,
    },
  }
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatLastSeen(value: string) {
  const diffMs = Date.now() - new Date(value).getTime()
  const diffMin = Math.floor(diffMs / 60_000)

  if (diffMin < 1) return "Vừa xong"
  if (diffMin < 60) return `${diffMin} phút trước`

  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour} giờ trước`

  const diffDay = Math.floor(diffHour / 24)
  return `${diffDay} ngày trước`
}

export default function UsersPage() {
  const [globalSearch, setGlobalSearch] = useState("")
  const [sorting, setSorting] = useState<SortingState>([{ id: "updatedAt", desc: true }])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 12 })
  const [roleFilter, setRoleFilter] = useState<UserRoleCode | "all">("all")
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>("all")
  const [presenceFilter, setPresenceFilter] = useState<PresenceFilter>("all")
  const [readinessFilter, setReadinessFilter] = useState<ReadinessFilter>("all")

  const usersQuery = useQuery({
    queryKey: [
      "users",
      "mock-list",
      pagination.pageIndex,
      pagination.pageSize,
      globalSearch,
      roleFilter,
      activityFilter,
      presenceFilter,
      readinessFilter,
      sorting,
    ],
    queryFn: () =>
      fetchMockUsers({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: globalSearch,
        role: roleFilter,
        activity: activityFilter,
        presence: presenceFilter,
        readiness: readinessFilter,
        sorting,
      }),
    placeholderData: (previous) => previous,
  })

  const data = usersQuery.data
  const pageCount = Math.max(data?.meta.totalPages ?? 1, 1)

  const handleAction = (action: string, user: MockUser) => {
    toast.info(`Mock ${action}: ${user.name}`)
  }

  const columns = useMemo<ColumnDef<MockUser>[]>(
    () => [
      {
        id: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nhân sự" />,
        cell: ({ row }) => {
          const user = row.original

          return (
            <div className="flex min-w-[18rem] items-center gap-3">
              <Avatar className="size-10 ring-1 ring-border/70">
                <AvatarFallback className="bg-primary/10 text-primary">{getInitials(user.name)}</AvatarFallback>
              </Avatar>

              <div className="min-w-0 space-y-1">
                <p className="truncate font-medium text-foreground">{user.name}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <Badge variant="secondary">@{user.username}</Badge>
                  <span className="truncate text-muted-foreground">{user.email}</span>
                </div>
              </div>
            </div>
          )
        },
      },
      {
        id: "role",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Vai trò / Nhóm" />,
        cell: ({ row }) => {
          const user = row.original
          return (
            <div className="min-w-[13rem] space-y-2">
              <Badge variant="outline">{user.role.name}</Badge>
              <div className="text-xs text-muted-foreground">
                <p>{user.team}</p>
                <p>Ca: {user.shift}</p>
              </div>
            </div>
          )
        },
      },
      {
        id: "workload",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái xử lý" />,
        cell: ({ row }) => {
          const user = row.original
          return (
            <div className="min-w-[13rem] space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant={user.isActive ? "default" : "secondary"}>
                  {user.isActive ? "Đang hoạt động" : "Đã khóa"}
                </Badge>
                <Badge variant={user.isOnline ? "default" : "outline"}>{user.isOnline ? "Online" : "Offline"}</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant={user.isReadyProcessing ? "outline" : "secondary"}>
                  {user.isReadyProcessing ? "Sẵn sàng" : "Đang bận"}
                </Badge>
                <Badge variant="secondary">Đang xử lý: {user.countProcessing}</Badge>
              </div>
            </div>
          )
        },
      },
      {
        id: "performance",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Hiệu suất" />,
        cell: ({ row }) => {
          const user = row.original
          const performanceRatio = Math.min(100, Math.round((user.handledLeads / 240) * 100))

          return (
            <div className="min-w-[12rem] space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Lead đã xử lý</span>
                <span className="font-medium text-foreground">{user.handledLeads}</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full",
                    performanceRatio >= 70 ? "bg-emerald-500" : performanceRatio >= 45 ? "bg-amber-500" : "bg-rose-500"
                  )}
                  style={{ width: `${performanceRatio}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">Hoạt động gần nhất: {formatLastSeen(user.lastSeenAt)}</p>
            </div>
          )
        },
      },
      {
        id: "updatedAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Cập nhật" />,
        cell: ({ row }) => {
          const user = row.original
          return (
            <div className="min-w-[11rem] text-xs text-muted-foreground">
              <p className="font-medium text-foreground">{formatDateTime(user.updatedAt)}</p>
              <p>Tạo: {formatDateTime(user.createdAt)}</p>
              <p>{user.phone ?? "Chưa có số điện thoại"}</p>
            </div>
          )
        },
      },
      {
        id: "actions",
        enableSorting: false,
        header: () => <div className="text-right">Thao tác</div>,
        cell: ({ row }) => {
          const user = row.original
          return (
            <div className="flex justify-end">
              <DataTableRowAction
                onView={() => handleAction("xem", user)}
                onEdit={() => handleAction("sửa", user)}
                onDelete={() => handleAction("khóa", user)}
              />
            </div>
          )
        },
      },
    ],
    []
  )

  const summaryCards = [
    {
      title: "Tổng nhân sự",
      value: data?.summary.total ?? 0,
      icon: Icons.users,
      tone: "text-blue-600 bg-blue-500/10",
    },
    {
      title: "Đang hoạt động",
      value: data?.summary.active ?? 0,
      icon: Icons.checkCircle2,
      tone: "text-emerald-600 bg-emerald-500/10",
    },
    {
      title: "Online",
      value: data?.summary.online ?? 0,
      icon: Icons.zap,
      tone: "text-violet-600 bg-violet-500/10",
    },
    {
      title: "Sẵn sàng xử lý",
      value: data?.summary.ready ?? 0,
      icon: Icons.workflow,
      tone: "text-amber-600 bg-amber-500/10",
    },
  ] as const

  const toolbarLeft = (
    <>
      <Select
        value={roleFilter}
        onValueChange={(value) => {
          setRoleFilter(value as UserRoleCode | "all")
          setPagination((prev) => ({ ...prev, pageIndex: 0 }))
        }}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Vai trò" />
        </SelectTrigger>
        <SelectContent align="start">
          <SelectItem value="all">Vai trò: Tất cả</SelectItem>
          {ROLES.map((role) => (
            <SelectItem key={role.code} value={role.code}>
              {role.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={activityFilter}
        onValueChange={(value) => {
          setActivityFilter(value as ActivityFilter)
          setPagination((prev) => ({ ...prev, pageIndex: 0 }))
        }}
      >
        <SelectTrigger className="w-[170px]">
          <SelectValue placeholder="Hoạt động" />
        </SelectTrigger>
        <SelectContent align="start">
          <SelectItem value="all">Hoạt động: Tất cả</SelectItem>
          <SelectItem value="active">Đang hoạt động</SelectItem>
          <SelectItem value="inactive">Đã khóa</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={presenceFilter}
        onValueChange={(value) => {
          setPresenceFilter(value as PresenceFilter)
          setPagination((prev) => ({ ...prev, pageIndex: 0 }))
        }}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Online" />
        </SelectTrigger>
        <SelectContent align="start">
          <SelectItem value="all">Online: Tất cả</SelectItem>
          <SelectItem value="online">Đang online</SelectItem>
          <SelectItem value="offline">Đang offline</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={readinessFilter}
        onValueChange={(value) => {
          setReadinessFilter(value as ReadinessFilter)
          setPagination((prev) => ({ ...prev, pageIndex: 0 }))
        }}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Sẵn sàng" />
        </SelectTrigger>
        <SelectContent align="start">
          <SelectItem value="all">Xử lý: Tất cả</SelectItem>
          <SelectItem value="ready">Sẵn sàng</SelectItem>
          <SelectItem value="busy">Đang bận</SelectItem>
        </SelectContent>
      </Select>
    </>
  )

  return (
    <div className="space-y-4 p-4 md:p-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Người dùng</h1>
        <p className="text-sm text-muted-foreground">
          Mock 500 user, có filter, phân trang, sort và giả lập gọi API khi tìm kiếm/chuyển trang.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title} className="py-3">
              <CardHeader className="px-3 pb-1">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              </CardHeader>
              <CardContent className="px-3">
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-semibold tabular-nums">{card.value.toLocaleString("vi-VN")}</p>
                  <span className={cn("inline-flex size-9 items-center justify-center rounded-lg", card.tone)}>
                    <Icon className="size-4" />
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="py-3">
        <CardContent className="px-3">
          <DataTable
            columns={columns}
            data={data?.items ?? []}
            pagination={pagination}
            pageCount={pageCount}
            sorting={sorting}
            globalSearch={globalSearch}
            onGlobalSearchChange={(value) => {
              setGlobalSearch(value)
              setPagination((prev) => ({ ...prev, pageIndex: 0 }))
            }}
            onSortingChange={(updater: Updater<SortingState>) => {
              setSorting((prev) => (typeof updater === "function" ? updater(prev) : updater))
              setPagination((prev) => ({ ...prev, pageIndex: 0 }))
            }}
            onPaginationChange={(updater: Updater<PaginationState>) => {
              setPagination((prev) => (typeof updater === "function" ? updater(prev) : updater))
            }}
            toolbarLeft={toolbarLeft}
            toolbarRight={
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() => usersQuery.refetch()}
                disabled={usersQuery.isFetching}
              >
                {usersQuery.isFetching ? <Icons.spinner className="size-4 animate-spin" /> : <Icons.refreshCw className="size-4" />}
                Tải lại
              </Button>
            }
            isLoading={usersQuery.isFetching}
            viewOptions
          />
        </CardContent>
      </Card>
    </div>
  )
}
